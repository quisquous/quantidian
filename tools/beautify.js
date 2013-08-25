var _ = require('underscore');
var beautify = require('js-beautify');
var fs = require('fs');

var jsOptions = {
  indent_size: 2,
  indent_char: ' ',
  indent_level: 0,
  indent_with_tabs: false,
  preserve_newlines: true,
  max_preserve_newlines: 2,
  jslint_happy: false,
  brace_style: 'collapse',
  keep_array_indentation: false,
  keep_function_indentation: false,
  space_before_conditional: true,
  break_chained_methods: false,
  eval_code: false,
  unescape_strings: true,
  wrap_line_length: 80
};

var cssOptions = {
  indent_size: 2,
  indent_char: ' ',
};

var htmlOptions = {
  indent_inner_html: false,
  indent_size: 2,
  indent_char: ' ',
  brace_style: 'collapsed',
  wrap_line_length: 0,
  indent_scripts: 'normal',
  preserve_newlines: true,
  max_preserve_newlines: 2,
  indent_handlebars: true
};

function beautifyFile(filename) {
  var funcMap = {
    '.js': function(text) {
      return beautify.js(text, jsOptions) + '\n';
    },
    '.css': function(text) {
      return beautify.css(text, cssOptions);
    },
    '.html': function(text) {
      return beautify.html(text, htmlOptions);
    }
  };

  var extension = _.find(_.keys(funcMap), function(ext) {
    return filename.slice(-ext.length) === ext;
  });
  if (!extension) {
    return;
  }

  fs.readFile(filename, 'ascii', function(err, text) {
    if (err) {
      console.log(err);
      return;
    }
    var beautified = funcMap[extension](text);
    fs.writeFile(filename, beautified, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

process.argv.forEach(function(filename, index) {
  if (index <= 1) {
    return;
  }
  beautifyFile(filename);
});
