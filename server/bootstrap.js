Meteor.startup(function() {
  var initCategories = function() {
    Categories.insert({
      name: 'test1',
      longdesc: 'This is a test prompt.',
      type: 'multiplechoice',
      timestamp: new Date().getTime(),
      choices: [
        { desc: 'Terrible', value: 1 },
        { desc: 'Bad', value: 2 },
        { desc: 'OK', value: 3 },
        { desc: 'Good', value: 4 },
        { desc: 'Fantastic', value: 5 },
      ],
    });
    Categories.insert({
      name: 'test2',
      longdesc: 'Pick a letter.',
      type: 'multiplechoice',
      timestamp: new Date().getTime(),
      choices: [
        { desc: 'A', value: 'A' },
        { desc: '\u03A0', value: '\u03A0' },
        { desc: 'Q', value: 'Q' },
        { desc: 'Z', value: 'Z' },
      ],
    });
    Categories.insert({
      name: 'test3',
      longdesc: 'Make a note.',
      type: 'text',
      timestamp: new Date().getTime(),
    });
  };

  if (Categories.find().count() === 0) {
    initCategories();
  }
});
