Categories = new Meteor.Collection('categories');
Data = new Meteor.Collection('data');

var userLocation;
navigator.geolocation.getCurrentPosition(function(position) {
  userLocation = position;
});

function subscribedCategoryIds() {
  // FIXME: Need to add a user here and find the categories they care about.
  var test = Categories.find({name: {$in: ['test1', 'test2', 'test3']}});
  return test.map(function(item) { return item._id; });
}

function subscribedCategories() {
  // FIXME: subscribedCategories is an ordered list.  Need to respect that
  // order through the map here.
  return Categories.find({'_id': {$in: subscribedCategoryIds()}}).fetch();
}

function logData(categoryId, value) {
  var timestamp = new Date().getTime();
  var datum = {
    user_id: Meteor.userId(),
    category_id: categoryId,
    timestamp: timestamp,
    created: timestamp,
    modified: timestamp,
    deleted: false,
    comment: '',
    value: value,
  };
  if (userLocation) {
    datum.location = userLocation.coords;
  }
  Data.insert(datum);

  // FIXME: Need some animation here about this getting recorded?
}

Template.main.subscribed = subscribedCategories;

Template.category.typeIs = function(type) {
  return this.type === type;
};

Template.type_choice.events({
  'click': function() {
    Session.set("selectedChoice", this.value);
    // FIXME: Add some large click-jacking animation that covers the page.
    logData(Session.get("selectedCategory"), this.value);
  },
});

Template.main.events({
  // FIXME: This really should be the Bootstrap 'shown' event.
  'click': function(e) {
    Session.set("selectedCategory", this._id);
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
  var category = Categories.findOne({'_id': this.category_id});
  if (!category)
    return "error: couldn't find category";
  var date = new Date(this.created);
  var dateString = date.toDateString() + " " + date.toTimeString();
  if (category.type === "multiplechoice") {
    var searchValue = this.value;
    var choice = _.find(category.choices, function(choice) {
      return choice.value === searchValue;
    });
    return category.name + ": " + choice.desc + " (" + dateString + ")";
  } else if (category.type == "text") {
    return category.name + ": " + this.value + " (" + dateString + ")";
  } else {
    return "error"
  }
}
