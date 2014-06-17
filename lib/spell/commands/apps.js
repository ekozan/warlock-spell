/*
* apps.js: Commands related to app resources
*
* (C) 2010, Nodejitsu Inc.
*
*/

var spell = require('../../spell');
    // async = utile.async;

var apps = exports;

apps.usage = [
  'The `spell apps` command manages',
  'Applications on Spell. Valid commands are:',
  '',
  'spell apps deploy',
  'spell apps list',
  'spell apps create',
  'spell apps cloud [<name>]',
  'spell apps view [<name>]',
  'spell apps update [<name>]',
  'spell apps destroy [<name>]',
  'spell apps start [<name>]',
  'spell apps restart [<name>]',
  'spell apps stop [<name>]',
  'spell apps setdrones [<name>] <number>',
  '',
  'For commands that take a <name> parameter, if no parameter',
  'is supplied, spell will attempt to read the package.json',
  'from the current directory.'
];


apps.deploy = function(callback){

  var dir = process.cwd(),
    pkg;
  spell.bundle.get(dir, function(err, pkg){
    spell.prompt.confirm('You will deploy '+ pkg.name.black + ' ok?'.green.bold, { default: 'yes'}, function(){
      spell.bundle.uploadTarball(null, pkg, false, function (err, snapshot) {
          if (err) {
            return callback(err, snapshot);
          }
        });
    });
  });
}