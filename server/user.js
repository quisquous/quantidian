// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function defaultCategories() {
  return Categories.find({
    default_category: true
  }).fetch();
}

function defaultSubscriptions() {
  var subs = defaultCategories().map(
    function(item) {
      return {
        _id: item._id,
        enable: true
      };
    }
  );
  return subs;
}

function generateApiKey() {
  var keyLength = 32;
  var charSet =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
