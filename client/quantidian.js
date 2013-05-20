Categories = new Meteor.Collection('categories');

Template.categories.subscribed = function() {
  var subscribedCategories = function() {
    // FIXME: Need to add a user here and find the categories they care about.
    var test = Categories.findOne({name: 'test'});
    if (!test)
      return [];
    return [test._id];
  };

  // FIXME: subscribedCategories is an ordered list.  Need to respect that
  // order through the map here.
  var cursor = Categories.find({'_id': {$in: subscribedCategories()}});
  return cursor.map(function(item) { return item; });
};

Template.category.typeIs = function(type) {
  return this.type === type;
};
