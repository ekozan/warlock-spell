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


apps.deploy = function(){
  warlock.bundle.get(process.cwd(), function(err, pkg){

  });
}