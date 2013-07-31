Categories = new Meteor.Collection('categories');
Data = new Meteor.Collection('data');

function currentCategory() {
  return Categories.findOne({'_id': Session.get('category_id')});
}

Meteor.Router.add({
  '/': 'main',
  '/editor': 'editor',
  '/category/:id': function(id) {
    Session.set('category_id', id);
    return 'category';
  }
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
    // TODO(enne): make this prettier.
    return Meteor.Router.page();
  }
}

var userLocation;
navigator.geolocation.getCurrentPosition(function(position) {
  userLocation = position;
});

function pluckId(cursor) {
  return cursor.map(function(item) { return item._id; });
}

function subscribedCategoryIds() {
  // FIXME: Need to add a user here and find the categories they care about.
  var test = Categories.find({name: {$in: ['test1', 'test2', 'test3']}});
  var userCreated = Categories.find({creator: Meteor.userId()});

  return pluckId(test).concat(pluckId(userCreated));
}

function subscribedCategories() {
  // FIXME: subscribedCategories is an ordered list.  Need to respect that
  // order through the map here.
  return Categories.find({'_id': {$in: subscribedCategoryIds()}}).fetch();
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

    Meteor.Router.to('/');
  },
});

Template.logEntries.recentLogs = function() {
  var limit = 10;
  var logs = Data.find(
    {
      user_id: Meteor.userId(),
      deleted: false
    },
    {
      sort: {created: -1},
      limit: limit,
    }
  ).fetch();
  return logs;
}

Template.logEntries.stringifyLog = function() {
  var category = categoryToString(this.category_id);
  var value = valueToString(this.category_id, this.value);
  var dateString = dateToString(this.created);
  if (!category || !value)
    return;
  return category + ": " + value + " (" + dateString + ")";
}

function categoryToString(id) {
  var category = Categories.findOne({'_id': id});
  if (!category)
    return "";
  return category.name;
}

function valueToString(category_id, values) {
  var category = Categories.findOne({'_id': category_id});
  if (!category)
    return "";
  var valueString = "";
  // FIXME: sanity check values vs. category questions length
  for (var i = 0; i < values.length; ++i) {
    var question = category.questions[i];
    var thisValue = undefined;
    if (question.type === "multiplechoice") {
      var searchValue = values[i];
      var choice = _.find(question.choices, function(choice) {
        // FIXME: stored values are strings here, so using == :(
        return choice.value == searchValue;
      });
      if (choice) {
        thisValue = choice.desc;
      }
    } else if (question.type == "text") {
      thisValue = values[i];
    } else {
      thisValue = "???";
    }

    if (valueString === "") {
      valueString = thisValue;
    } else {
      valueString += " / " + thisValue;
    }
  }
  return valueString;
}

function dateToString(timestamp) {
  // FIXME: Do something smarter here like "5 minutes ago"
  var date = new Date(timestamp);
  return date.toDateString() + " " + date.toTimeString();
}
