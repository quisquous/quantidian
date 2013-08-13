Categories = new Meteor.Collection('categories');
Meteor.subscribe('defaultCategories');
Meteor.subscribe('ownCategories');

Data = new Meteor.Collection('data');
Meteor.subscribe('ownData');

Meteor.subscribe('ownUser');

currentCategoryId = function() {
  return Session.get('category_id');
};

currentCategory = function() {
  return Categories.findOne({'_id': currentCategoryId()});
};
