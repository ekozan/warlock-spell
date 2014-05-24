
var path = require('path'),
    spell = require('../spell');

//
// Store the original `jitsu.config.load()` function
// for later use.
//
var _load = spell.config.load;

//
// Update env if using Windows
//
if (process.platform == "win32") {
  process.env.HOME = process.env.USERPROFILE;
}

//
// Setup target file for `.jitsuconf`.
//
//
// TODO: Refactor broadway to emit `bootstrap:after` and put this
// code in a handler for that event
//
try {
  spell.config.env().file({
    file: spell.argv.spellconf || spell.argv.j || '.spellconf',
    dir: process.env.HOME,
    search: true
  });
}
catch (err) {
  console.log('Error parsing ' + spell.config.stores.file.file.magenta);
  console.log(err.message);
  console.log('');
  console.log('This is most likely not an error in spell');
  console.log('Please check the .jitsuconf file and try again');
  console.log('');
  process.exit(1);
}


var defaults = {
  colors: true,
  loglevel: 'info',
  loglength: 110,
  protocol: 'https',
  "deploy-sub-domain":"sass.3ko.fr",
  requiresAuth: ['apps'],
  root: process.env.HOME,
  timeout: 4 * 60 * 1000,
  tmproot: path.join(process.env.HOME, '.spell/tmp'),
  userconfig: '.spell/.spellconf',
};


spell.config.defaults(defaults);

//
// Use the `flatiron-cli-config` plugin for `jitsu config *` commands
//
spell.use(require('flatiron-cli-config'), {
  store: 'file',
  restricted: [
    'auth',
    'root',
    'remoteUri',
    'tmproot',
    'userconfig'
  ],
  before: {
    list: function () {
      var username = spell.config.get('username'),
          configFile = spell.config.stores.file.file;

      var display = [
        ' here is the ' + configFile.grey + ' file:',
        'To change a property type:',
        'spell config set <key> <value>',
      ];

      if (!username) {
        spell.log.warn('No user has been setup on this machine');
        display[0] = 'Hello' + display[0];
      }
      else {
        display[0] = 'Hello ' + username.green + display[0];
      }

      display.forEach(function (line) {
        spell.log.help(line);
      });

      return true;
    }
  }
});

//
// Override `jitsu.config.load` so that we can map
// some existing properties to their correct location.
//
spell.config.load = function (callback) {
  _load.call(spell.config, function (err, store) {
    if (err) {
      return callback(err, true, true, true);
    }

    spell.config.set('userconfig', spell.config.stores.file.file);

    if (store.auth) {
      var auth = store.auth.split(':');
      spell.config.clear('auth');
      spell.config.set('username', auth[0]);
      spell.config.set('password', auth[1]);
      // create a new token and remove password from being saved to .jitsuconf
      spell.tokens.create(auth[0], (spell.config.get('apiTokenName')||'spell'), function(err, result) {
          if(!err && result) {
            var token = Object.getOwnPropertyNames(result).filter(function(n){return n !== 'operation'}).pop();
            spell.config.set('apiToken', result[token]);
            spell.config.set('apiTokenName', token);
            spell.config.clear('password');
            return spell.config.save(callback);
          }
        });


    }

    callback(null, store);
  });
};

