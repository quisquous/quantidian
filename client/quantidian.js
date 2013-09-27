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

Meteor.Router.add({
  '/': 'main',
  '/editor': 'editor',
  '/logs': 'logs',
  '/subscribe': 'subscribe',
  '/settings': 'settings',
  '/category/:id': function(id) {
    Session.set('category_id', id);
    return 'category';
  }
});

Template.actionBar.isPage = function(page) {
  return Meteor.Router.page() === page;
};

Template.actionBar.title = function() {
  return 'Quantidian';
};

Template.actionBar.subtitle = function() {
  if (Meteor.Router.page() === 'main') {
    return '';
  } else if (Meteor.Router.page() === 'category') {
    var category = currentCategory();
    return category.name;
  } else {
    var str = Meteor.Router.page();
    return str[0].toUpperCase() + str.slice(1);
  }
};

var userLocation;
navigator.geolocation.getCurrentPosition(function(position) {
  userLocation = position;
});

function subscribedCategories() {
  var subs = Meteor.user().subscriptions;
  var categories = [];
  _.each(subs, function(sub) {
    if (sub.enable) {
      // Bogus categories are just silently ignored here and cleaned elsewhere.
      var category = Categories.findOne({
        '_id': sub._id
      });
      if (category) {
        categories.push(category);
      }
    }
  });
  return categories;
}

Template.main.subscribed = subscribedCategories;

Template.category.typeIs = function(type) {
  return this.type === type;
};

Template.category.categoryObj = currentCategory;

Template.category.events({
  'click .save': function(evt, template) {
    var selectedInput = template.findAll('.userinput.active');
    var values = _.map(selectedInput, function(elem) {
      return elem.value;
    });
    var category = currentCategory();
    // FIXME: Make this rudimentary validation better
    if (values.length !== category.questions.length)
      return;

    var timestamp = new Date().getTime();
    var data = {
      owner: Meteor.userId(),
      category_id: category['_id'],
      timestamp: timestamp,
      value: values
    };
    if (userLocation) {
      var coords = userLocation.coords;
      data.location = _.pick(coords, _.filter(_.keys(coords), function(key) {
        return coords[key] !== null;
      }));
    }
    Data.insert(data);

    Meteor.Router.to('main');
  }
});
