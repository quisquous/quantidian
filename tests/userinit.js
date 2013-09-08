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
