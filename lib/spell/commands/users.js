var spell = require('../../spell'),
    utile = require('../common'),
    async = utile.async,
    prompt = require('prompt');

var users = exports;

users.usage = [
  'The `spell users` command manages',
  'Applications on Spell. Valid commands are:',
  '',
  'spell users login',
  '',
];

users.login = function (callback) {
  var args = utile.args(arguments);
 
  if (arguments.length) {
    callback = args.callback;
  }

	var schema = {
		properties: {
			hostname: {
				description: 'Warlock URI',
				required: true
			},
			username: {
				description: 'Username',
				pattern: /^[a-zA-Z\s\-]+$/,
				message: 'Name must be only letters, spaces, or dashes',
				required: true
			},
			password: {
				description: "Password",
				required: true,
				hidden: true
			}
		}
	};
  // prompt.message = "prompt".grey;
  // 	prompt.start();
	spell.prompt.get(schema, function (err, result) {
		if(err){
			return callback(err);
		}

		spell.config.set("remoteUri",result.hostname);
		spell.config.set("user",result.username);
		spell.config.set("password",result.password);


		spell.log.info('Try to log-in ... wait pleaze ');
		async.series([
			function login(){
				spell.users.auth(
					function(err, result){
						if(err){
							return callback(err);
						}
						callback();
					}
				);
			}
		]);
  	});

  // 
};


