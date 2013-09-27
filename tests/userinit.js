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

suite('userinit', function() {
  authTest('initialization', function(done, server, client) {
    var user = client.evalSync(function() {
      emit('return', Meteor.user());
    });

    assert.isString(user.apikey, 'user has a string apikey');
    assert.operator(user.apikey.length, '>', 0,
      'user has a non-empty apikey');

    assert.operator(user.subscriptions.length, '>', 0,
      'new users have default subscriptions');
    _.each(user.subscriptions, function(sub) {
      assert.strictEqual(sub.enable, true,
        'default subscriptions are enabled: ' + JSON.stringify(sub));
    });

    var categories = client.evalSync(function() {
      emit('return', Categories.find().fetch());
    });

    assert.operator(categories.length, '>', 0,
      'new users have visible default categories');
    assert.strictEqual(user.subscriptions.length, categories.length,
      'new users subscribed to all default categories');

    var logs = client.evalSync(function() {
      emit('return', Data.find().fetch());
    });
    assert.strictEqual(logs.length, 0, 'new users have no logs');

    done();
  });
});
