// name: String, a short-hand name for the category, e.g. "mood" or "beer"
// longdesc: String, a prompt for the user
// type: String, a string corresponding to a Type
// timestamp: time of creation
// TODO:
// creator: id (from users)

Categories = new Meteor.Collection('categories');

Data = new Meteor.Collection('data');
