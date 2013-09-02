Meteor.startup(function() {
  var initCategories = function() {
    Categories.insert({
      name: 'test1',
      longdesc: 'Just a test description.',
      timestamp: new Date().getTime(),
      default_category: true,
      questions: [{
        label: 'This is a test prompt',
        type: 'multiplechoice',
        optional: false,
        choices: [{
          desc: 'Terrible',
          value: 1
        }, {
          desc: 'Bad',
          value: 2
        }, {
          desc: 'OK',
          value: 3
        }, {
          desc: 'Good',
          value: 4
        }, {
          desc: 'Fantastic',
          value: 5
        }]
      }, {
        label: 'Optional comment',
        type: 'text',
        optional: true
      }]
    });
    Categories.insert({
      name: 'test2',
      longdesc: 'Letter and text.',
      timestamp: new Date().getTime(),
      default_category: true,
      questions: [{
        label: 'Some text',
        type: 'multiplechoice',
        optional: false,
        choices: [{
          desc: 'A',
          value: 'A'
        }, {
          desc: 'Π',
          value: 'Π'
        }, {
          desc: 'Q',
          value: 'Q'
        }, {
          desc: 'Z',
          value: 'Z'
        }]
      }, {
        label: 'Type something here',
        optional: false,
        type: 'text'
      }]
    });
    Categories.insert({
      name: 'test3',
      longdesc: 'Test description 3',
      timestamp: new Date().getTime(),
      default_category: true,
      questions: [{
        label: 'Make a note.',
        optional: false,
        type: 'text'
      }]
    });
  };

  if (Categories.find().count() === 0) {
    initCategories();
  }
});
