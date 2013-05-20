Categories = new Meteor.Collection('categories');

function subscribedCategoryIds() {
  // FIXME: Need to add a user here and find the categories they care about.
  var test = Categories.find({name: {$in: ['test1', 'test2', 'test3']}});
  return test.map(function(item) { return item._id; });
}

function subscribedCategories() {
  // FIXME: subscribedCategories is an ordered list.  Need to respect that
  // order through the map here.
  var cursor = Categories.find({'_id': {$in: subscribedCategoryIds()}});
  return cursor.map(function(item) { return item; });
}

Template.topLevelCategories.subscribed = subscribedCategories;
Template.categories.subscribed = subscribedCategories;

Template.topLevelCategories.events({
  'click': function() {
    Session.set("selectedChoice", undefined);
    Session.set("selectedCategory", this._id);
  },
});

Template.category.typeIs = function(type) {
  return this.type === type;
};

Template.category.selectionClass = function() {
  var selected = Session.equals("selectedCategory", this._id);
  return selected ? "selected" : "unselected";
};
Template.topLevelCategory.selectionClass = Template.category.selectionClass;

Template.type_choice.events({
  'click': function() {
    Session.set("selectedChoice", this.value);
  },
});

Template.type_choice.selectionClass = function() {
  var selected = Session.equals("selectedChoice", this.value);
  return selected ? "selected" : "unselected";
}
