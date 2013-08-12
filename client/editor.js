Template.editor.editor = function() {
  var editor = Session.get('editor');
  if (!editor) {
    Session.set('editor', {});
    editor = {};
  }

  if (!editor.questions || !editor.questions.length) {
    editorAddQuestion();
  }
  return Session.get('editor');
}

function editorAddQuestion() {
  var editor = Session.get('editor');
  var new_num;
  if (!editor.questions || !editor.questions.length) {
    editor.questions = [];
    new_num = 1;  // displayed to the user, so start at 1
  } else {
    new_num = _.max(editor.questions, function(q) { return q.num; }).num + 1;
  }

  editor.questions.push({
    num: new_num,
    type: 'text',
    optional: false,
  });
  Session.set('editor', editor);

  editorAddChoice(new_num);
}

function editorAddChoice(num) {
  var editor = Session.get('editor');
  var q = _.find(editor.questions, function(q) { return q.num == num; });

  var new_num;
  if (!q.choices || !q.choices.length) {
    q.choices = [];
    new_num = 1;  // displayed to the user, so start at 1
  } else {
    new_num = _.max(q.choices, function(c) { return c.num; }).num + 1;
  }

  q.choices.push({
    num: new_num,
    text: '',
    value: '',
  });
  Session.set('editor', editor);
}

function editorUpdateChoice(question_num, choice_num, key, value) {
  var editor = Session.get('editor');
  var q = _.find(editor.questions, function(q) { return q.num == question_num; });
  var c = _.find(q.choices, function(c) { return c.num == choice_num; });
  c[key] = value;
  Session.set('editor', editor);
}

function removeAndRenumber(list, num) {
  list = _.filter(list, function(obj) { return obj.num != num; });
  var count = 1;
  _.each(list, function(obj) { obj.num = count++; });
  return list;
}

function choiceNumForElement(elem) {
  return $(elem).parents('.editorchoice').attr('num');
}

Template.editor.events({
  'change .categoryname': function(evt) {
    editorUpdateField('name', evt.target.value);
  },
  'change .categorydesc': function(evt) {
    editorUpdateField('longdesc', evt.target.value);
  },
  'click .addquestion': function(evt, template) {
    editorAddQuestion();
  },
  'click .savecategory': function(evt, template) {
    // FIXME: make sure required fields are filled in blah blah blah
    // FIXME: probably should validate this too
    var editor = Session.get('editor');

    // Delete editor-only fields.
    _.each(editor.questions, function(q) { delete q.num; });
    _.each(editor.questions.choices, function(c) { delete c.num; });

    editor.creator = Meteor.userId();
    editor.timestamp = new Date().getTime();
    var newId = Categories.insert(editor);
    var newSub = {
      _id: newId,
      enable: true,
    };
    // FIXME: This adds the new sub twice!
    Meteor.users.update(Meteor.userId(), {$push: {subscriptions: newSub}});

    Session.set('editor', {});
    Meteor.Router.to('main');
  },
});

Template.editorQuestion.isOptional = function() {
  var editor = Session.get('editor');
  var num = this.num;
  var q = _.find(editor.questions, function(q) { return q.num == num; });
  if (!q) {
    return;
  }
  return q.optional;
}

function editorUpdateField(key, value) {
  var editor = Session.get('editor');
  editor[key] = value;
  Session.set('editor', editor);
}

function editorUpdateQuestion(num, key, value) {
  var editor = Session.get('editor');
  var q = _.find(editor.questions, function(q) { return q.num == num; });
  if (!q) {
    return;
  }
  q[key] = value;
  Session.set('editor', editor);
}

Template.editorQuestion.events({
  'change .prompt': function(evt, template) {
    editorUpdateQuestion(template.data.num, 'label', evt.target.value);
  },
  'click .optional': function(evt, template) {
    editorUpdateQuestion(template.data.num, 'optional', evt.target.checked);
  },
  'click .type': function(evt, template) {
    editorUpdateQuestion(template.data.num, 'type', evt.target.value);
  },
  'click .deletequestion': function(evt, template) {
    var editor = Session.get('editor');
    editor.questions = removeAndRenumber(editor.questions, template.data.num);
    Session.set('editor', editor);

    if (!editor.questions.length) {
      editorAddQuestion();
    }
  },
  'click .addchoice': function(evt, template) {
    editorAddChoice(template.data.num);
  },
  'click .deletechoice': function(evt, template) {
    var editor = Session.get('editor');
    var q = _.find(editor.questions, function(q) { return q.num == template.data.num; });
    var choice_num = choiceNumForElement(evt.target);
    q.choices = removeAndRenumber(q.choices, choice_num);
    Session.set('editor', editor);

    if (!q.choices.length) {
      editorAddChoice(template.data.num);
    }
  },
  'change .choicetext': function(evt, template) {
    editorUpdateChoice(template.data.num, choiceNumForElement(evt.target), 'desc', evt.target.value);
  },
  'change .choicevalue': function(evt, template) {
    editorUpdateChoice(template.data.num, choiceNumForElement(evt.target), 'value', evt.target.value);
  },
});

Template.editorQuestion.typeIs = function(type) {
  return this.type === type;
};
