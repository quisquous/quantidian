function getLogs(limit, category_id) {
  var query = {
    user_id: Meteor.userId(),
    deleted: false
  };
  if (category_id) {
    query.category_id = category_id;
  }
  var logs = Data.find(
    query,
    {
      sort: {created: -1},
      limit: limit,
    }
  ).fetch();
  return logs;
}

Template.logs.allLogs = function() {
  // FIXME: Add more buttons, etc.
  return getLogs(500);
};

Template.recentLogEntries.recentLogs = function() {
  return getLogs(5);
};

Template.recentCategoryLogEntries.recentLogs = function() {
  var category_id = currentCategoryId();
  return getLogs(5, category_id);
};

Template.logs.stringifyLog = function() {
  return stringifyLog(this);
};

Template.recentLogEntries.stringifyLog = function() {
  return stringifyLog(this);
};

Template.recentCategoryLogEntries.stringifyLog = function() {
  return stringifyLog(this);
};

function stringifyLog(entry) {
  var category = categoryToString(entry.category_id);
  var value = valueToString(entry.category_id, entry.value);
  var dateString = dateToString(entry.created);
  if (!category || !value)
    return;
  return category + ": " + value + " (" + dateString + ")";
};

function categoryToString(id) {
  var category = Categories.findOne({'_id': id});
  if (!category)
    return "";
  return category.name;
}

function valueToString(category_id, values) {
  var category = Categories.findOne({'_id': category_id});
  if (!category)
    return "";
  var valueString = "";
  // FIXME: sanity check values vs. category questions length
  for (var i = 0; i < values.length; ++i) {
    var question = category.questions[i];
    var thisValue = undefined;
    if (question.type === "multiplechoice") {
      var searchValue = values[i];
      var choice = _.find(question.choices, function(choice) {
        // FIXME: stored values are strings here, so using == :(
        return choice.value == searchValue;
      });
      if (choice) {
        thisValue = choice.desc;
      }
    } else if (question.type == "text") {
      thisValue = values[i];
    } else {
      thisValue = "???";
    }

    if (valueString === "") {
      valueString = thisValue;
    } else {
      valueString += " / " + thisValue;
    }
  }
  return valueString;
}

function dateToString(timestamp) {
  // FIXME: Do something smarter here like "5 minutes ago"
  var date = new Date(timestamp);
  return date.toDateString() + " " + date.toTimeString();
}
