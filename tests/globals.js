// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

  var newUser = server.evalSync(function(user) {
    var newId = Accounts.createUser(user);
    var newUser = Meteor.users.findOne({
      _id: newId
    });
    emit('return', newUser);
  }, user);
  return newUser;
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
