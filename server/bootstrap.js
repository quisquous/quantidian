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
  };

  if (Categories.find().count() === 0) {
    initCategories();
  }
});
