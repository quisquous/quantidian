Categories = new Meteor.Collection('categories');
Data = new Meteor.Collection('data');

var userLocation;
navigator.geolocation.getCurrentPosition(function(position) {
  userLocation = position;
});

function subscribedCategoryIds() {
  // FIXME: Need to add a user here and find the categories they care about.
  var test = Categories.find({name: {$in: ['test1', 'test2', 'test3']}});
  return test.map(function(item) { return item._id; });
}

function subscribedCategories() {
  // FIXME: subscribedCategories is an ordered list.  Need to respect that
  // order through the map here.
  return Categories.find({'_id': {$in: subscribedCategoryIds()}}).fetch();
}

Template.main.subscribed = subscribedCategories;

Template.category.typeIs = function(type) {
  return this.type === type;
};

Template.category.events({
  'click .save': function(evt, template) {
    var selectedInput = template.findAll('.userinput.active');
    var values = _.map(selectedInput, function(elem) {
      return elem.value;
    });
    var categoryId = $('.categoryTab.active')[0].getAttribute('category');
    var category = Categories.findOne({'_id': categoryId});
    // FIXME: Make this rudimentary validation better
    if (values.length !== category.questions.length)
      return;

    var timestamp = new Date().getTime();
    var data = {
      user_id: Meteor.userId(),
      category_id: categoryId,
      timestamp: timestamp,
      created: timestamp,
      modified: timestamp,
      deleted: false,
      value: values,
    };
    if (userLocation) {
      data.location = userLocation.coords;
    }
    Data.insert(data);

    $('#categoryTabs a[href="#maintab"]').tab('show')
  },
});

Template.logEntries.recentLogs = function() {
  var limit = 10;
  var logs = Data.find(
    {
      user_id: Meteor.userId(),
      deleted: false
    },
    {
      sort: {created: -1},
      limit: limit,
    }
  ).fetch();
  return logs;
}

Template.logEntries.stringifyLog = function() {
  var category = categoryToString(this.category_id);
  var value = valueToString(this.category_id, this.value);
  var dateString = dateToString(this.created);
  if (!category || !value)
    return;
  return category + ": " + value + " (" + dateString + ")";
}

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

Template.editor.questions = function() {
  var questions = Session.get('editorQuestions');
  if (questions) {
    return questions;
  }

  editorAddQuestion();
  return Session.get('editorQuestions');
};

function editorAddQuestion() {
  var questions = Session.get('editorQuestions');
  var new_num;
  if (!questions || !questions.length) {
    questions = [];
    new_num = 1;  // displayed to the user, so start at 1
  } else {
    new_num = _.max(questions, function(q) { return q.num; }).num + 1;
  }

  questions.push({
    num: new_num,
    type: 'text',
    optional: false,
  });
  Session.set('editorQuestions', questions);
}

Template.editor.events({
  'click .addquestion': function(evt, template) {
    editorAddQuestion();
  },
  'click .savecategory': function(evt, template) {
  },
});

Template.editorQuestion.questionTypes = function() {
  return [
    { name: 'Multiple Choice', key: 'multiplechoice' },
    { name: 'Text', key: 'text' },
  ];
};

function editorUpdateQuestion(num, key, value) {
  var questions = Session.get('editorQuestions');
  var q = _.find(questions, function(q) { return q.num == num; });
  if (!q) {
    return;
  }
  q[key] = value;
  Session.set('editorQuestions', questions);
}

Template.editorQuestion.events({
  'change .prompt': function(evt, template) {
    editorUpdateQuestion(template.data.num, 'prompt', evt.target.value);
  },
  'change .optional': function(evt, template) {
    editorUpdateQuestion(template.data.num, 'optional', evt.target.checked);
  },
  'change .type': function(evt, template) {
    editorUpdateQuestion(template.data.num, 'type', evt.target.value);
  },
  'click .deletequestion': function(evt, template) {
    var num = template.data.num;
    if (num === undefined) {
      return;
    }
    var questions = Session.get('editorQuestions');
    if (!questions) {
      console.error('Missing questions');
      return;
    }
    questions = _.filter(questions, function(q) { return q.num != num; });

    var count = 1;
    _.each(questions, function(q) { q.num = count++; });

    Session.set('editorQuestions', questions);
  },
});

Template.editorQuestion.rendered = function() {
  // This is easier to do in JavaScript than HTML.  Yuck.  :(

  var type = this.data.type;
  var typeOptionElem = $(this.firstNode).find('.type > option[value="' + type + '"]');
  typeOptionElem.attr('selected', true);

  var optional = this.data.optional;
  var typeCheckboxElem = $(this.firstNode).find('.optional');
  if (optional) {
    typeCheckboxElem.attr('checked', true);
  } else {
    typeCheckboxElem.removeAttr('checked');
  }
};
