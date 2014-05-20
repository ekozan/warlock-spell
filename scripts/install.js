var q = require('./question.js');
(function pre_init() {

var t = setTimeout(function() {
  console.log('\nQuestion canceled, you can still enable pm2 monitoring via `$ pm2 subscribe`');
  WatchDog.refuse(function() {
    process.exit(0);
  });
}, 10000);

  q.askOne({ info: 'Would you like to be notified by email when a problem is detected on your server (server offline) ? (y/n)', required : false }, function(result){
  clearTimeout(t);

  if (result == 'y' || result == 'Y') {

    function get_email() {
      q.askOne({ info: 'Email' }, function(email){
      
      });
    }
  }
  else {

  }
});

});