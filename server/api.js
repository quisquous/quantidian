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

function apiLogs(user, params) {
  // FIXME: filter out user_id
  var results = Data.find({
    owner: user._id
  }, {
    skip: params.skip,
    limit: params.limit,
    sort: {
      timestamp: 1
    }
  }).fetch();
  return [200, JSON.stringify(results)];
}

function apiCategories(user, params) {
  var results = Categories.find({
    $or: [{
      default_category: true
    }, {
      owner: user._id
    }]
  }, {
    skip: params.skip,
    limit: params.limit,
    sort: {
      timestamp: 1
    }
  }).fetch();
  return [200, JSON.stringify(results)];
}

var entries = [{
  url: 'logs',
  type: 'POST',
  func: apiLogs,
  inputs: {
    user: {
      required: true,
      type: 'str'
    },
    apikey: {
      required: true,
      type: 'str'
    },
    skip: {
      required: false,
      type: 'int',
      default_value: 0,
      min: 0
    },
    limit: {
      required: false,
      type: 'int',
      default_value: 200,
      min: 1,
      max: 200
    }
  }
}, {
  url: 'categories',
  type: 'POST',
  func: apiCategories,
  inputs: {
    user: {
      required: true,
      type: 'str'
    },
    apikey: {
      required: true,
      type: 'str'
    },
    skip: {
      required: false,
      type: 'int',
      default_value: 0,
      min: 0
    },
    limit: {
      required: false,
      type: 'int',
      default_value: 200,
      min: 1,
      max: 200
    }
  }
}];

function validate(entry, params) {
  var paramKeys = _.keys(params);
  var validKeys = _.keys(entry.inputs);

  var error;

  _.each(paramKeys, function(key) {
    if (!_.contains(validKeys, key)) {
      error = [400, 'Unknown key: ' + key];
      return;
    }

    var paramInfo = entry.inputs[key];
    var paramValue = params[key];
    if (paramInfo.type === 'int') {
      var intValue = parseInt(paramValue);
      if (parseFloat(paramValue) !== intValue || isNaN(paramValue)) {
        error = [400, 'Invalid value for key: ' + key];
        return;
      }
      if ('min' in paramInfo && intValue < paramInfo.min) {
        error = [400, 'Min value exceeded for key: ' + key];
      }
      if ('max' in paramInfo && intValue > paramInfo.max) {
        error = [400, 'Max value exceeded for key: ' + key];
      }
    }
  });

  _.each(validKeys, function(key) {
    if (_.contains(paramKeys, key))
      return;
    if (entry.inputs[key].required) {
      error = [400, 'Missing required key: ' + key];
    } else if ('default_value' in entry.inputs[key]) {
      params[key] = entry.inputs[key].default_value;
    }
  });

  return error;
}

function authenticate(entry, params) {
  var user = Meteor.users.findOne(params.user);
  if (!user)
    return undefined;
  if (params.apikey !== user.apikey)
    return undefined;
  return user;
}

_.each(entries, function(entry) {
  Meteor.Router.add('/api/' + entry.url, entry.type, function() {
    var queryParams = this.request.query;
    if (_.size(queryParams) > 0) {
      return [400, 'All parameters must be passed in request body\n'];
    }

    var params = this.request.body;
    var error = validate(entry, params);
    if (error) {
      return error;
    }

    var user = authenticate(entry, params);
    if (!user) {
      return [403, 'Invalid user and/or apikey specified'];
    }

    return entry.func(user, params);
  });
});

Meteor.Router.add('/api/*', [404, 'Unknown API entry']);
