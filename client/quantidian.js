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

Template.main.subscribed = subscribedCategories;

Template.category.typeIs = function(type) {
  return this.type === type;
};

Template.main.events({
  // FIXME: This really should be the Bootstrap 'shown' event.
  'click .categoryTab': function(e) {
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
  var category = categoryToString(this.category_id);
  var value = valueToString(this.category_id, this.value);
  var dateString = dateToString(this.created);
  if (!category || !value)
    return;
  var commentString = "";
  if (this.comment) {
    commentString = ' "' + this.comment + '"';
  }
  return category + ": " + value + commentString + " (" + dateString + ")";
}

Template.typeChoice.events({
  'click': function() {
    var data = packData(this.value);
    Session.set("confirmData", data);
    $('#dataModal').modal('show');
  },
});

Template.typeText.events({
  'click .save': function(evt, template) {
    var textElems = template.findAll('.text');
    if (!textElems || !textElems[0].value)
      return;
    var data = packData(textElems[0].value);
    Session.set("confirmData", data);
    $('#dataModal').modal('show');
  },
});

Template.dataModal.confirmData = function() {
  var data = Session.get("confirmData");
  // FIXME: If the #with confirmData is undefined, it doesn't react when set.
  if (!data)
    return {}
  return data;
};

Template.dataModal.categoryName = function() {
  return categoryToString(this.category_id);
};

Template.dataModal.valueString = function() {
  return valueToString(this.category_id, this.value);
};

Template.dataModal.dateString = function() {
  return dateToString(this.created);
};

Template.dataModal.locationString = function() {
  if (!this.location)
    return 'unknown';
  return 'recorded';
};

Template.dataModal.events({
  'click .accept': function() {
    var commentElem = document.getElementById('modalComment');
    if (commentElem) {
      this.comment = commentElem.value;
    }
    // FIXME: validation
    Data.insert(this);

    $('#categoryTabs a[href="#maintab"]').tab('show')
    $('#dataModal').modal('hide');
    Session.set("confirmData", undefined);
  },
});

function categoryToString(id) {
  var category = Categories.findOne({'_id': id});
  if (!category)
    return "";
  return category.name;
}

function valueToString(category_id, value) {
  var category = Categories.findOne({'_id': category_id});
  if (!category)
    return "";
  if (category.type === "multiplechoice") {
    var searchValue = value;
    var choice = _.find(category.choices, function(choice) {
      return choice.value === searchValue;
    });
    return choice.desc;
  } else if (category.type == "text") {
    return value;
  } else {
    return "";
  }
}

function dateToString(timestamp) {
  // FIXME: Do something smarter here like "5 minutes ago"
  var date = new Date(timestamp);
  return date.toDateString() + " " + date.toTimeString();
}

function packData(value) {
  var categoryId = Session.get("selectedCategory");
  var timestamp = new Date().getTime();
  var data = {
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
    data.location = userLocation.coords;
  }
  return data;
}
