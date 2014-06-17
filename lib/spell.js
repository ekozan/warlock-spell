var path = require('path'),
    util = require('util'),
    colors = require('colors'),
    flatiron = require('flatiron');
require('pkginfo')(module, 'name', 'version');

var spell = module.exports = flatiron.app;

spell.use(flatiron.plugins.cli, {
  version: true,
  usage: require('./spell/usage'),
  before: function()
  {
    spell.log.info("eeee");
  },
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
      alias: 'y',
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

require('./spell/config');


spell.bundle = require('./spell/bundle');
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

  ['Users', 'Apps', 'Snapshots'].forEach(function (key) {
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
spell.api.Snapshots = require('warlock-api').Snapshots;

spell.welcome = function () {
  spell.log.info('Welcome to ' + 'Warlock Spell'.grey + ' ');
  spell.log.info('Spell v' + spell.version + ', node ' + process.version);
  spell.log.info('It worked if it ends with ' + 'Spell cast:'.grey + ' ok'.green.bold);
};





spell.start = function (callback) {
 
  var useColors = (typeof spell.argv.colors == 'undefined' || spell.argv.colors);
  useColors || (colors.mode = "none");


  spell.init(function (err) {
      spell.welcome();
	    if (err) {
	      return callback(err);
	    }
      username = spell.config.get('username');
      if (!username && spell.config.get('requiresAuth').indexOf(spell.argv._[0]) !== -1) {
          return spell.log.error("Need to be log-in");
      }else{
          return spell.exec(spell.argv._, callback);
      }
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
	      return callback();
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


