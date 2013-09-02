$(document).on('click.radiogroup', '.radioitem', function(e) {
  if (!e.target) {
    return;
  }
  var btn = $(e.target);
  var group = btn.closest('.radiogroup');
  if (!group) {
    return;
  }
  group.find('.radioitem').removeClass('active');
  btn.addClass('active');
  group.attr('value', btn.attr('value'));
});
