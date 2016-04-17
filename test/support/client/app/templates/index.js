[
  'application',
].forEach(function(t){
  var v = './'+t.replace('/', '-');
  var k = t.replace('application/', '');
  Em.TEMPLATES[k] = Em.HTMLBars.template(require(v));
});
