// name: String, a short-hand name for the category, e.g. "mood" or "beer"
// longdesc: String, a longer description for use when subscribin
// type: String, a string corresponding to a Type
// timestamp: time of creation
// questions: Array, an array of question objects
// TODO:
// creator: id (from users)
Categories = new Meteor.Collection('categories');

// user_id: id, refers to _id from the Users collection.
// category_id: id, refers to _id from the Categories collection.
// timestamp: Timestamp, the timestamp this log represents
// created: Timestamp, when this entry was created
// modified: Timestamp, when this entry was last modified
// location: optional Dictionary, contains all the fields in the coordinates
//     interface in the W3C Geolocation API spec:
//     http://dev.w3.org/geo/api/spec-source.html#coordinates_interface
// deleted, Boolean, editing a log marks the old one as deleted.
// comment: optional String, representing a comment about this log.
//
// For multiple choice and text types:
// value: String, representing whatever the value was.
Data = new Meteor.Collection('data');

Meteor.publish("userData", function() {
  return Meteor.users.find(
    {_id: this.userId},
    {fields: {'subscriptions': 1}}
  );
});

// FIXME: only certain fields
Meteor.users.allow({
  update: function(userId, user, fields, modifier) {
    if (user._id === userId) {
      return true;
    } else {
      return false;
    }
  },
});
