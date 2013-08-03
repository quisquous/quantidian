Meteor.Router.add({
  '/': 'main',
  '/editor': 'editor',
  '/logs': 'logs',
  '/subscribe': 'subscribe',
  '/category/:id': function(id) {
    Session.set('category_id', id);
    return 'category';
  },
});

Template.actionBar.isPage = function(page) {
  return Meteor.Router.page() === page;
}

Template.actionBar.title = function() {
  return "Quantidian";
}

Template.actionBar.subtitle = function() {
  if (Meteor.Router.page() === "main") {
    return "";
  } else if (Meteor.Router.page() === "category") {
    var category = currentCategory();
    return category.name;
  } else {
    // FIXME: make this prettier.
    var str = Meteor.Router.page();
    return str[0].toUpperCase() + str.slice(1);
  }
}

var userLocation;
navigator.geolocation.getCurrentPosition(function(position) {
  userLocation = position;
});

function subscribedCategories() {
  var subs = Meteor.user().subscriptions;
  var categories = [];
  _.each(subs, function(sub) {
    if (sub.enable) {
      categories.push(Categories.findOne({'_id': sub._id}));
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
      user_id: Meteor.userId(),
      category_id: category['_id'],
      timestamp: timestamp,
      created: timestamp,
      modified: timestamp,
      deleted: false,
      value: values,
    };
    if (userLocation) {
      data.location = userLocation.coords;
    }
    Data.insert(data);

    Meteor.Router.to('main');
  },
});

