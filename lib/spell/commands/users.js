var spell = require('../../spell'),
    utile = require('../common'),
    tools = require('warlock-api').tools,
    async = utile.async,
    prompt = require('prompt');

var users = exports;

users.usage = [
  'The `spell users` command manages',
  'Applications on Spell. Valid commands are:',
  '',
  'spell users login',
  'spell users logout',
  '',
  'spell users create',
  '',
  'spell users me',

];

users.create = function (callback) {
  var args = utile.args(arguments);
  if (arguments.length) {
    callback = args.callback;
  }
  var user = {};

  spell.prompt.get(schema, function (err, result) {
    if(err){
      return callback(err);
    }

    spell.config.set("remoteUri",result.hostname);

    user.email = result.email;
    tools.pbkdf2(result.password,user.email,function(err,key){
      user.pkey = key;
      spell.users.create(user,function(err, result){
        if(err) return callback(err);
        callback(result);
      });
    });
  });
}

users.logout = function (callback) {
  spell.config.clear("pkey");
  if(spell.config.get("security") && spell.config.get("security") == "paranoid")
  {
    users.clear(callback);
  }
  spell.config.save(function(err){
    if(err) return callback(err);
    callback();
  });
}

users.clear = function(callback)
{
  spell.config.clear("pkey");
  spell.config.clear("remoteUri");
  spell.config.clear("email");
  spell.config.save(function(err){
    if(err) return callback(err);
    callback();
  });
}

users.login = function (callback) {
  var args = utile.args(arguments);

  if (arguments.length) {
    callback = args.callback;
  }

  if(spell.config.get("pkey") && spell.config.get("email"))
  {
      return callback({"message":"already loged"});

//    spell.prompt.confirm('You are already loged in. Do you whant to stay login with ' + spell.config.get("email").green.bold +'?'.green.bold, { default: 'yes'}, callback());
  }


	spell.prompt.get(schema, function (err, result) {
		if(err){
			return callback(err);
		}

    var email = result.email;
    var password = result.password;

		spell.config.set("remoteUri",result.hostname);

    tools.pbkdf2(password,email,function(err,key){
      if(err) return callback(err);

			spell.users.auth(email,key,function(err, result){
				if(err) return callback(err);
        spell.log.info('Your are now log-in, account info:');
        spell.inspect.putObject(result, 2);
        spell.config.set("email",email);
        spell.config.set("pkey",key);
        spell.config.save(function(err){
          if(err) return callback(err);
          callback(null,result);
        });
			});
    });
  });
  //
};

users.me = function (callback) {
  return callback({"message":"not implemented"});
}


var schema = {
  properties: {
    hostname: {
      description: 'Warlock URI',
      default:spell.config.get("remoteUri"),
      required: true
    },
    email: {
      description: 'Email',
      pattern: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|fr|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b$/,
      message: 'Email must be only an valid email',
      default:spell.config.get("email"),
      required: true
    },
    password: {
      description: "Password",
      required: true,
      hidden: true
    }
  }
};
