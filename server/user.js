function defaultCategories() {
  return Categories.find({default_category:true}).fetch();
}

function defaultSubscriptions() {
  var subs = defaultCategories().map(
    function(item) {
      return {
        _id: item._id,
        enable: true,
      };
    }
  );
  return subs;
}

function generateApiKey() {
  var keyLength = 32;
  var charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var key = [];

  while (key.length < keyLength) {
    key.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return key.join('');
}

Accounts.onCreateUser(function(options, user) {
  user.subscriptions = defaultSubscriptions();
  user.apikey = generateApiKey();
  if (options.profile)
    user.profile = options.profile;
  return user;
});
