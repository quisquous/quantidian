async = require('async');
request = require('request');

var defaultSkip = 0;
var defaultLimit = 200;
var maxLimit = 200;

function logUri(server) {
  var uri = server.evalSync(function() {
    emit('return', Meteor.absoluteUrl('api/logs'));
  });
  return uri;
}

suite('log api', function() {
  var addLogs = function(server, user, maxRecords, numOffset) {
    assert.operator(user.subscriptions.length, '>', 0);

    server.evalSync(function(user, maxRecords, numOffset) {
      var addLog = function(num) {
        var catId = user.subscriptions[0]._id;
        var data = {
          owner: user._id,
          category_id: catId,
          // Ensure that time moves forward.
          timestamp: new Date().getTime() + num,
          values: [num + numOffset]
        };
        Data.insert(data);
      };

      for (var i = 0; i < maxRecords; ++i) {
        addLog(i);
      }
      emit('return');
    }, user, maxRecords, numOffset);
  };

  var testLogAPI = function(callback, server, user, maxRecords, numOffset) {
    var uri = logUri(server);

    var callLogApi = function(skip, limit, callback) {
      var form = {
        user: user._id,
        apikey: user.apikey
      };
      if (skip !== undefined) {
        form.skip = skip;
      }
      if (limit !== undefined) {
        form.limit = limit;
      }

      request.post(uri, {
        form: form
      }, function() {
        callback.apply(this, arguments);
      });
    };

    var verifyLogs = function(body, skip, limit) {
      var logs = JSON.parse(body);
      var expectedNumLogs = Math.max(Math.min(skip + limit, maxRecords) -
        skip, 0);
      assert.strictEqual(logs.length, expectedNumLogs);

      var caseInfo = JSON.stringify({
        skip: skip,
        limit: limit
      }) + ': ';

      var lastTime;
      for (var idx = 0; idx < limit; ++idx) {
        if (idx + skip >= maxRecords) {
          break;
        }
        assert.operator(logs.length, '>=', idx, caseInfo +
          'right number of logs');
        var log = logs[idx];

        if (lastTime !== undefined) {
          assert.operator(log.timestamp, '>', lastTime, caseInfo +
            'sorted logs');
        }
        lastTime = log.timestamp;

        var num = log.values[0];
        assert.equal(num, idx + skip + numOffset, caseInfo +
          'found right log');
      }
    };

    // Expects success; verifies that skip and limit are respected.
    var callSuccess = function(skip, limit) {
      return function(callback) {
        callLogApi(skip, limit, function(error, response, body) {
          if (skip < 0) {
            callback();
            return;
          }
          assert.isNull(error);
          if (skip === undefined) {
            skip = defaultSkip;
          }
          if (limit === undefined) {
            limit = defaultLimit;
          }
          verifyLogs(body, skip, limit);
          callback();
        });
      }
    };

    async.parallel([
      callSuccess(undefined, undefined),
      callSuccess(0, 200),
      callSuccess(undefined, 1),
      callSuccess(2, undefined),
      // Skip past the end of the records.
      callSuccess(maxRecords, undefined),
      // Skip exactly to the end of the records.
      callSuccess(maxRecords - defaultLimit, undefined)
    ], function() {
      callback();
    });
  };

  test('one client no logs', function(done, server) {
    // Calling logs apis still valid even with no logs.
    var user1 = createTestUser(server, 0);
    testLogAPI(done, server, user1, 0, 0);
  });

  test('one client with logs', function(done, server) {
    // Well-formed log requests when logs exist behave properly.
    var user1 = createTestUser(server, 0);
    var maxRecords = 300;
    var testRandomOffset = 123;
    addLogs(server, user1, maxRecords, testRandomOffset);
    testLogAPI(done, server, user1, maxRecords, testRandomOffset);
  });

  test('two clients', function(done, server) {
    // Two clients can't see the others logs.
    var user1 = createTestUser(server, 0);
    var user2 = createTestUser(server, 1);
    var maxRecords1 = 150;
    var maxRecords2 = 350;
    var testRandomOffset1 = 13484;
    var testRandomOffset2 = 581;
    addLogs(server, user1, maxRecords1, testRandomOffset1);
    addLogs(server, user2, maxRecords2, testRandomOffset2);

    async.parallel([
      function(callback) {
        testLogAPI(callback, server, user1, maxRecords1,
          testRandomOffset1);
      },
      function(callback) {
        testLogAPI(callback, server, user2, maxRecords2,
          testRandomOffset2);
      }
    ], function() {
      done();
    });
  });

  test('bad authentication', function(done, server) {
    var uri = logUri(server);

    var testAuthentication = function(user, apikey, statusCode) {
      return function(callback) {
        var form = {};
        if (user !== undefined) {
          form.user = user;
        }
        if (apikey !== undefined) {
          form.apikey = apikey;
        }
        request.post(uri, {
          form: form
        }, function(error, response, body) {
          var caseInfo = JSON.stringify({
            user: user,
            apikey: apikey
          });
          assert.equal(response.statusCode, statusCode,
            'status code for ' + caseInfo);
          callback();
        });
      };
    };

    var user1 = createTestUser(server, 0);
    var user2 = createTestUser(server, 1);

    // apikeys are randomly generated so may be the same between users.
    var notAPIKey1 = user2.apikey;
    if (notAPIKey1 === user1.apikey) {
      notAPIKey1 += 'x';
    }
    var notAPIKey2 = user1.apikey;
    if (notAPIKey2 === user2.apikey) {
      notAPIKey2 += 'x';
    }

    async.parallel([
      // apikey and user are required, so 400 if missing.
      testAuthentication(undefined, undefined, 400),
      testAuthentication(user2._id, undefined, 400),
      testAuthentication(undefined, user1.apikey, 400),

      // 403 error if pass both, but they're wrong.
      testAuthentication(user1._id, notAPIKey1, 403),
      testAuthentication(user2._id, notAPIKey2, 403)
    ], function() {
      done();
    });
  });

  test('bad form values', function(done, server) {
    var uri = logUri(server);
    var user = createTestUser(server, 0);
    var testParams = function(form) {
      return function(callback) {
        var caseInfo = JSON.stringify(form);
        form.user = user._id;
        form.apikey = user.apikey;
        request.post(uri, {
          form: form
        }, function(error, response, body) {
          assert.equal(response.statusCode, 400, 'status code for ' +
            caseInfo);
          callback();
        });
      };
    };

    async.parallel([
      // Bad param names
      testParams({
        bogus: true
      }),
      testParams({
        bogus: true,
        alsobogus: 1
      }),
      testParams({
        skip: 2,
        limit: 5,
        bogus: true
      }),

      // Bad values
      testParams({
        skip: -1
      }),
      testParams({
        skip: -1,
        limit: 50
      }),
      testParams({
        limit: -1
      }),
      testParams({
        limit: 0
      }),
      testParams({
        limit: maxLimit + 1
      }),

      // Bad types
      testParams({
        skip: 'not an int'
      }),
      testParams({
        limit: true
      }),
      testParams({
        skip: 3.1
      }),
      testParams({
        limit: [1, 2, 3]
      })
    ], function() {
      done();
    });
  });
});
