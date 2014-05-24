var path = require('path'),
    util = require('util'),
    colors = require('colors'),
    flatiron = require('flatiron');
require('pkginfo')(module, 'name', 'version');

var spell = module.exports = flatiron.app;

spell.use(flatiron.plugins.cli, {
  version: true,
  usage: require('./spell/usage'),
  source: path.join(__dirname, 'spell', 'commands'),
  argv: {
    version: {
      alias: 'v',
      description: 'print spell version and exit',
      string: true
    },
    colors: {
      description: '--no-colors will disable output coloring',
      default: true,
      boolean: true
    },
    confirm: {
      alias: 'c',
      description: 'prevents spell from asking before overwriting/removing things',
      default: false,
      boolean: true
    }
  }
});

spell.options.log = {
  console: {
    raw: spell.argv.raw
  }
};



spell.prompt.override = spell.argv;

//

require('./spell/config');


spell.package = require('./spell/bundle');
spell.api = {};
spell.api.started = false;
spell.api.init = function (callback) {
  if (spell.api.start === true) {
    return callback();
  }

  var userAgent = spell.config.get('headers:user-agent');
  if (!userAgent) {
    spell.config.set('headers:user-agent', 'spell/' + spell.version);
  }

  ['Users', 'Apps'].forEach(function (key) {
    var k = key.toLowerCase();
    spell[k] = new spell.api[key](spell.config);
    spell[k].on('debug::request', debug);
    spell[k].on('debug::response', debug);
    function debug (data) {
      if (spell.argv.debug || spell.config.get('debug')) {
        if (data.headers && data.headers['Authorization']) {
          data = JSON.parse(JSON.stringify(data));
          data.headers['Authorization'] = Array(data.headers['Authorization'].length).join('*');
        }

        util.inspect(data, false, null, true).split('\n').forEach(spell.log.debug);
      }
    };
  });
  spell.api.started = true;
  return callback();
};
spell.api.Client = require('warlock-api').Client;
spell.api.Apps = require('warlock-api').Apps;
spell.api.Users = require('warlock-api').Users;

spell.welcome = function () {
  spell.log.info('Welcome to ' + 'Warlock Spell'.grey + ' ');
  spell.log.info('Spell v' + spell.version + ', node ' + process.version);
  spell.log.info('It worked if it ends with ' + 'Spell cast:'.grey + ' ok'.green.bold);
};





spell.start = function (callback) {
 
  var useColors = (typeof spell.argv.colors == 'undefined' || spell.argv.colors);
  useColors || (colors.mode = "none");


  spell.init(function (err) {
	    if (err) {
	      spell.welcome();
	      // jitsu.showError(jitsu.argv._.join(' '), err);
	      return callback(err);
	    }

      spell.welcome();

     return spell.exec(spell.argv._, callback);
   });
};

spell.exec = function (command, callback) {
	function execCommand (err) {
	    if (err) {
	      return callback(err);
	    }

	    spell.log.info('Executing command ' + command.join(' ').magenta);
	    spell.router.dispatch('on', command.join(' '), spell.log, function (err, shallow) {
			if (err) {
				spell.showError(command.join(' '), err, shallow);
				return callback(err);
			}
	      callback();
	    });
  	}


 return spell.api.started ? execCommand(): spell.api.init(execCommand);
};


spell.showError = function(command, err, shallow, skip){
  spell.log.info('\n');
  spell.log.error('Error on command : ' + command.magenta);
  if (err.result) {
      if (err.result.message) {
        spell.log.error(err.result.message);
      }
  }
  else if (err.message) {
    spell.log.error("Error msg : "+err.message);
  }
}


