var testCategory = {
  name: 'testCategory',
  longdesc: 'A testCategory',
  timestamp: new Date().getTime(),
  questions: [{
    label: 'prompt',
    optional: false,
    type: 'text'
  }]
};

function insertTestCategory(client) {
  var catId = client.evalSync(function(cat) {
    cat.owner = Meteor.userId();
    emit('return', Categories.insert(cat));
  }, testCategory);

  return catId;
}

function insertTextData(client, catId, text) {
  var newId = client.evalSync(function(catId, text) {
    var data = {
      owner: Meteor.userId(),
      category_id: catId,
      timestamp: new Date().getTime(),
      values: [text]
    };
    var newId = Data.insert(data);
    emit('return', newId);
  }, catId, text);

  return newId;
}

function allClientLogs(client) {
  return client.evalSync(function() {
    emit('return', Data.find().fetch());
  });
}

suite('logs', function() {
  var insertAndVerify = function(client) {
    var inserted = {};
    var logOrder = [];

    function insertCategory() {
      var catId = insertTestCategory(client);
      inserted[catId] = [];
      return catId;
    }

    function insertText(catId, text) {
      var logId = insertTextData(client, catId, text);
      assert.property(inserted, catId,
        'test sanity check that category already added');
      inserted[catId].push(logId);
      logOrder.push(logId);
      return logId;
    }

    var cat1 = insertTestCategory(client);
    insertTextData(client, cat1, '1');
    insertTextData(client, cat1, '2');

    var cat2 = insertTestCategory(client);
    insertTextData(client, cat2, '3');
    insertTextData(client, cat2, '4');

    insertTextData(client, cat1, '5');
    insertTextData(client, cat2, '6');

    var logs = allClientLogs(client);
    assert.strictEqual(logs.length, logOrder.length,
      'fetched all/only logs for client');
    var idx = 0;
    _.each(logs, function(log) {
      assert.strictEqual(log._id, logOrder[idx],
        'fetched logs in same order');
      assert.property(log.category_id, 'log has category id');
      assert.contains(inserted[log.category_id], log._id,
        'category correct');
      idx++;
    });
  };

  authTest('simple insert', function(done, server, client) {
    insertAndVerify(client);
    done();
  });

  authTest('two clients', function(done, server, client1, client2) {
    // Logs from client1 should not be visible to client2
    insertAndVerify(client1);
    insertAndVerify(client2);
    done();
  });
});
