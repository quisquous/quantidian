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

function userCreatedCategories() {
  return Categories.find({
    owner: Meteor.userId()
  }).fetch();
}

function defaultCategories() {
  return Categories.find({
    default_category: true
  });
}

Template.subscribe.categoryList = function() {
  var subs = Meteor.user().subscriptions;
  var data = _.map(subs, function(item) {
    return {
      category: function(sub_id) {
        return Categories.findOne({
          '_id': sub_id
        });
      }(item._id),
      enable: item.enable
    };
  });
  return _.filter(data, function(item) {
    return item.category;
  });
};

function validSubscriptions() {
  var subs = Meteor.user().subscriptions;
  return _.filter(subs, function(item) {
    return Categories.findOne({
      '_id': item._id
    });
  });
}

function setSubscriptionEnabled(sub_id, enabled) {
  var subs = validSubscriptions();
  var item = _.find(subs, function(item) {
    return item._id === sub_id;
  });
  if (item) {
    item.enable = enabled;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        subscriptions: subs
      }
    });
  }
}

function reorderSubscription(sub_id, dir) {
  var subs = validSubscriptions();
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

  Meteor.users.update(Meteor.userId(), {
    $set: {
      subscriptions: subs
    }
  });
}

Template.subscribe.events({
  'click .uparrow': function(evt) {
    reorderSubscription(this.category._id, -1);
  },
  'click .downarrow': function(evt) {
    reorderSubscription(this.category._id, 1);
  },
  'click .subscribe': function(evt) {
    setSubscriptionEnabled(this.category._id, true);
  },
  'click .unsubscribe': function(evt) {
    setSubscriptionEnabled(this.category._id, false);
  }
});
