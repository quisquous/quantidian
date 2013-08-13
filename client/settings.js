Template.settings.settingsItems = function() {
  var items = [
    {
      title: 'Account email',
      text: Meteor.user().emails[0].address,
    },
    {
      title: 'User ID',
      text: Meteor.userId(),
    },
  ];
  return items;
};
