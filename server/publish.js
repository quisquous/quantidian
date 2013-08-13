// name: String, a short-hand name for the category, e.g. "mood" or "beer"
// longdesc: String, a longer description for use when subscribin
// type: String, a string corresponding to a Type
// timestamp: time of creation
// questions: Array, an array of question objects
// owner: id (from users)
Categories = new Meteor.Collection('categories');

// owner: id, refers to _id from the Users collection.
// category_id: id, refers to _id from the Categories collection.
// timestamp: Timestamp, the timestamp this log represents
// location: optional Dictionary, contains all the fields in the coordinates
//     interface in the W3C Geolocation API spec:
//     http://dev.w3.org/geo/api/spec-source.html#coordinates_interface
//
// For multiple choice and text types:
// values: String, representing whatever the value was.
Data = new Meteor.Collection('data');

Meteor.publish("userData", function() {
  return Meteor.users.find(
    {_id: this.userId},
    {fields: {'subscriptions': 1, 'apikey': 1}}
  );
});

Meteor.users.allow({
  update: function(userId, user, fields, modifier) {
    if (user._id !== userId) {
      return false;
    }

    var foundBad = _.some(fields, function(fieldName) {
      return fieldName !== 'subscriptions';
    });

    return !foundBad;
  },
});
