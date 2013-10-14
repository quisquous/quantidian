// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function getLogs(limit, category_id) {
  var query = {
    owner: Meteor.userId()
  };
  if (category_id) {
    query.category_id = category_id;
  }
  var logs = Data.find(
    query, {
      sort: {
        timestamp: -1
      },
      limit: limit
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
  return stringifyLogValue(this);
};

function stringifyLog(entry) {
  var category = categoryToString(entry.category_id);
  var value = valueToString(entry.category_id, entry.value);
  if (!category || !value)
    return;
  return category + ': ' + value;
}

function stringifyLogValue(entry) {
  return valueToString(entry.category_id, entry.value);
}

function categoryToString(id) {
  var category = Categories.findOne({
    '_id': id
  });
  if (!category)
    return '';
  return category.name;
}

function valueToString(category_id, values) {
  var category = Categories.findOne({
    '_id': category_id
  });
  if (!category)
    return '';
  var valueString = '';
  // FIXME: sanity check values vs. category questions length
  for (var i = 0; i < values.length; ++i) {
    var question = category.questions[i];
    var thisValue = undefined;
    if (question.type === 'multiplechoice') {
      var searchValue = values[i];
      var choice = _.find(question.choices, function(choice) {
        // FIXME: stored values are strings here, so using == :(
        return choice.value == searchValue;
      });
      if (choice) {
        thisValue = choice.desc;
      }
    } else if (question.type == 'text') {
      thisValue = values[i];
    } else {
      thisValue = '???';
    }

    if (thisValue == '') {
      if (question.optional)
        continue;
      thisValue = '(blank)';
    }

    if (valueString === '') {
      valueString = thisValue;
    } else {
      valueString += ' / ' + thisValue;
    }
  }
  return valueString;
}
