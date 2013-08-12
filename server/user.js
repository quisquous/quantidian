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

Accounts.onCreateUser(function(options, user) {
  user.subscriptions = defaultSubscriptions();
  if (options.profile)
    user.profile = options.profile;
  return user;
});
