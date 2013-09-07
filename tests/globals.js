assert = require('chai').assert;
_ = require('underscore');

var testUsers = [{
  username: 'test',
  email: 'test@example.com',
  password: '12345'
}, {
  username: 'test2',
  email: 'test2@example.com',
  password: '12345'
}];

createTestUser = function(server, userIdx) {
  userIdx = userIdx || 0;
  var user = testUsers[userIdx];
  server.evalSync(function(user) {
    Accounts.createUser(user);
    emit('return');
  }, user);
};

loginAsTestUser = function(client, userIdx) {
  userIdx = userIdx || 0;
  var user = testUsers[userIdx];
  var error = client.evalSync(function(user) {
    Meteor.loginWithPassword(user.email, user.password, function(error) {
      emit('return', error);
    });
  }, user);
  assert.isNull(error, JSON.stringify(error));
};

authTest = function(message, callback) {
  if (callback === undefined) {
    return;
  }

  var numClients = callback.length - 2;
  assert.operator(numClients, '>', 0, 'authTest needs at least 1 client');
  assert.operator(numClients, '<=', 2,
    'authTest only supports at most 2 clients');

  // The test function checks the number of arguments passed to its callback,
  // so need separate entry points for different number of clients here.
  if (numClients === 1) {
    test(message, function(done, server, client) {
      createTestUser(server, 0);
      loginAsTestUser(client, 0);

      callback(done, server, client);
    });
  } else {
    test(message, function(done, server, client1, client2) {
      createTestUser(server, 0);
      loginAsTestUser(client1, 0);
      createTestUser(server, 1);
      loginAsTestUser(client2, 1);

      callback(done, server, client1, client2);
    });
  }
};
