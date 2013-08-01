Categories = new Meteor.Collection('categories');
Data = new Meteor.Collection('data');
Meteor.subscribe("userData");

currentCategoryId = function() {
  return Session.get('category_id');
};

currentCategory = function() {
  return Categories.findOne({'_id': currentCategoryId()});
};

pluckId = function(cursor) {
  return cursor.map(function(item) { return item._id; });
};

defaultCategories = function() {
  // FIXME: Make some real categories here.
  return Categories.find({name: {$in: ['test1', 'test2', 'test3']}});
};
