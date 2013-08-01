Categories = new Meteor.Collection('categories');
Data = new Meteor.Collection('data');

currentCategoryId = function() {
  return Session.get('category_id');
};

currentCategory = function() {
  return Categories.findOne({'_id': currentCategoryId()});
};
