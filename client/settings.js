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
    {
      title: 'API Key',
      text: Meteor.user().apikey,
    },
  ];
  return items;
};
