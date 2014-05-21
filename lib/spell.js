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
      description: 'print jitsu version and exit',
      string: true
    },
    colors: {
      description: '--no-colors will disable output coloring',
      default: true,
      boolean: true
    },
    confirm: {
      alias: 'c',
      description: 'prevents jitsu from asking before overwriting/removing things',
      default: false,
      boolean: true
    },
    release: {
      alias: 'r',
      description: 'specify release version number or semantic increment (build, patch, minor, major)',
      string: true
    }
  }
});

spell.options.log = {
  console: {
    raw: spell.argv.raw
  }
};

spell.prompt.override = spell.argv;

spell.api = {};
spell.api.Client = require('pm2-warlock-api').Client;
spell.api.Apps = require('pm2-warlock-api').Apps;
spell.api.Users = require('pm2-warlock-api').Users;

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


 return execCommand();
};
