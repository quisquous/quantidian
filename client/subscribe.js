function userCreatedCategories() {
  return Categories.find({creator: Meteor.userId()}).fetch();
}

Template.subscribe.categoryList = function() {
  // FIXME: lazy subscription list initialization shouldn't happen here.
  if (!Meteor.user().subscriptions) {
    console.log("lazy init");
    var subs = defaultCategories().map(
      function(item) {
        return {
          _id: item._id,
          enable: true,
        };
      }
    );
    Meteor.users.update(Meteor.userId(), {$set: {subscriptions: subs}});
  } else {
    var subs = Meteor.user().subscriptions;
  }

  // Make sure the user is subscribed to anything they've created.
  // FIXME: this should be an error and creating a category should do this
  // Or maybe the server could do it.
  var sub_ids = _.map(subs, function(sub) { return sub._id; });
  var update_user = false;

  _.each(userCreatedCategories(), function(item) {
    if (_.contains(sub_ids, item._id))
      return;
    update_user = true;
    sub_ids.push(item._id);
    subs.push({
      _id: item._id,
      enable: true,
    });
  });

  if (update_user) {
    console.log("missing subs");
    Meteor.users.update(Meteor.userId(), {$set: {subscriptions: subs}});
  }

  // FIXME: need to order this by sub_id
  var data =_.map(subs, function(item) {
    return {
      category: function(sub_id) {
        return Categories.findOne({'_id': sub_id});
      }(item._id),
      enable: item.enable,
    };
  });
  return data;
};

function setSubscriptionEnabled(sub_id, enabled) {
  var subs = Meteor.user().subscriptions;
  var item = _.find(subs, function(item) {
    return item._id === sub_id;
  });
  if (item) {
    item.enable = enabled;
    Meteor.users.update(Meteor.userId(), {$set: {subscriptions: subs}});
  }
}

function reorderSubscription(sub_id, dir) {
  var subs = Meteor.user().subscriptions;
  var indexOf = -1;
  for (var i = 0; i < subs.length; ++i) {
    if (subs[i]._id === sub_id) {
      indexOf = i;
      break;
    }
  }
  if (indexOf == -1)
    return;

  var dir = dir > 0 ? 1 : -1;
  if (indexOf + dir < 0 || indexOf + dir > subs.length - 1)
    return;

  var temp = subs[indexOf + dir];
  subs[indexOf + dir] = subs[indexOf];
  subs[indexOf] = temp;
  console.log(subs);

  Meteor.users.update(Meteor.userId(), {$set: {subscriptions: subs}});
}

Template.subscribe.events({
  'click .uparrow': function(evt) {
    console.log('up', this.category._id);
    reorderSubscription(this.category._id, -1);
  },
  'click .downarrow': function(evt) {
    console.log('down', this.category._id);
    reorderSubscription(this.category._id, 1);
  },
  'click .subscribe': function(evt) {
    console.log('subscribe', this.category._id);
    setSubscriptionEnabled(this.category._id, true);
  },
  'click .unsubscribe': function(evt) {
    console.log('unsubscribe', this.category._id);
    setSubscriptionEnabled(this.category._id, false);
  },
});
