
var colors = require('colors');

module.exports = [
  '  _____            _ _ '.cyan,
  ' / ____|          | | |'.cyan,
  '| (___  _ __   ___| | |'.cyan,
  ' \\___ \\| \'_ \\ / _ \\ | |'.cyan,
  ' ____) | |_) |  __/ | |'.cyan,
  '|_____/| .__/ \\___|_|_|'.cyan,
  '       | |             '.cyan,
  '       |_|             '.cyan,

  '',

  'Usage:'.cyan.bold.underline,
  '',
  ' spell <resource> <action> <param1> <param2> ...',
  '',

  'Common Commands:'.cyan.bold.underline,
  '',

  'To sign up for Warlock'.cyan,
  ' spell signup',
  '',

  'To log into Warlock'.cyan,
  ' spell login',
  '',

  'To install a pre-built application'.cyan,
  ' spell install',
  '',

  'Deploys current path to Warlock'.cyan,
  ' spell deploy',
  '',

  'Lists all applications for the current user'.cyan,
  ' spell list',
  '',

  'Additional Commands'.cyan.bold.underline,
  ' spell apps',
  ' spell users',
  ' spell logout'
];