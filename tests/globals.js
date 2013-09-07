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
  assert.isNull(error);
};

authTest = function(message, callback) {
  if (callback === undefined) {
    return;
  }
  test(message, function(done, server, client) {
    createTestUser(server, 0);
    loginAsTestUser(client, 0);

    callback(done, server, client);
  });
};
