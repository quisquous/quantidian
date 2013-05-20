Meteor.startup(function() {
  var initCategories = function() {
    Categories.insert({
      name: 'test',
      longdesc: 'This is a test prompt.',
      type: 'multiplechoice',
      timestamp: (new Date()).getTime(),
      choices: [
        { desc: 'Terrible', value: 1 },
        { desc: 'Bad', value: 2 },
        { desc: 'OK', value: 3 },
        { desc: 'Good', value: 4 },
        { desc: 'Fantastic', value: 5 },
      ],
    });
    Categories.insert({
      name: 'TestLetters',
      longdesc: 'Pick the letter you feel best describes you.',
      type: 'multiplechoice',
      timestamp: (new Date()).getTime(),
      choices: [
        { desc: 'A', value: 'A' },
        { desc: '\u03A0', value: '\u03A0' },
        { desc: 'Q', value: 'Q' },
        { desc: 'Z', value: 'Z' },
      ],
    });
  };

  // FIXME: temporary auto-create entries
  Categories.remove({});

  if (Categories.find().count() === 0) {
    initCategories();
  }
});
