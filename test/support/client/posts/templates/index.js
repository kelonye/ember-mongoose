[
  'posts',
  'posts/index',
].forEach(function(t){
  var mod = './'+t.replace('/', '-');
  Em.TEMPLATES[t] = Em.HTMLBars.template(require(mod));
});
