function checkFields(doc, required, optional) {
  var missingRequired = _.some(required, function(field) {
    return !(field in doc);
  });
  var unknownField = _.some(_.keys(doc), function(field) {
    return !_.contains(required, field) && !_.contains(optional, field);
  });
  return !missingRequired && !unknownField;
}

// *** Category collection

var requiredCategoryFields = [
  '_id',
  // String, a short-hand name for the category, e.g. "mood" or "beer"
  'name',
  // String, a longer description for use when subscribing
  'longdesc',
  // unix timestamp, time of creation
  'timestamp',
  // Array, an array of question objects
  'questions',
  // id, refers to _id from the Users collection.
  'owner',
];

// Other category fields:
// default_category: boolean, can't be specified by user

Categories = new Meteor.Collection('categories');

Categories.allow({
  insert: function(userId, doc) {
    if (!checkFields(doc, requiredCategoryFields)) {
      return false;
    }
    return doc.owner === userId;
  },
});

Meteor.publish("defaultCategories", function() {
  return Categories.find({default_category: true});
});

Meteor.publish("ownCategories", function() {
  return Categories.find({owner: this.userId});
});

// *** Data collection

var requiredDataFields = [
  '_id',
  // id, refers to _id from the Users collection.
  'owner',
  // id, refers to _id from the Categories collection.
  'category_id',
  // unix timestamp, the timestamp this log represents
  'timestamp',
  'value',
];

var optionalDataFields = [
  // optional Dictionary, contains all the fields in the coordinates interface
  // in the W3C Geolocation API spec.  Missing fields are null.
  // http://dev.w3.org/geo/api/spec-source.html#coordinates_interface
  'location',
];

Data = new Meteor.Collection('data');

Data.allow({
  insert: function(userId, doc) {
    if (!checkFields(doc, requiredDataFields, optionalDataFields)) {
      return false;
    }
    return doc.owner === userId;
  },
});

Meteor.publish("ownData", function() {
  return Data.find({owner: this.userId});
});

// *** User collection

Meteor.users.allow({
  update: function(userId, user, fields, modifier) {
    if (user._id !== userId) {
      return false;
    }

    var foundBad = _.some(fields, function(fieldName) {
      return fieldName !== 'subscriptions';
    });

    // FIXME: disallow subscribing to non-existent categories, which could
    // happen if insertion fails on the server end.

    return !foundBad;
  },
});

Meteor.publish("ownUser", function() {
  return Meteor.users.find(
    {_id: this.userId},
    {fields: {'subscriptions': 1, 'apikey': 1}}
  );
});

