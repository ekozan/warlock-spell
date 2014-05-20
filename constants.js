var p = require('path');
var fs = require('fs');
var util = require('util');

var DEFAULT_FILE_PATH = p.resolve(process.env.HOME, '.pm2');

var default_conf = {
  DEFAULT_FILE_PATH : DEFAULT_FILE_PATH,
  PM2SPELL_LOG_FILE_PATH : p.join(process.env.PM2_LOG_DIR || p.resolve(process.env.HOME, '.pm2'), 'pm2-spell.log'),
  DEFAULT_PID_PATH : p.join(DEFAULT_FILE_PATH, 'pids'),
  DEFAULT_LOG_PATH : p.join(DEFAULT_FILE_PATH, 'logs'),
  DUMP_FILE_PATH : p.join(DEFAULT_FILE_PATH, 'dump.pm2-spell'),

  // SAMPLE_CONF_FILE : '../lib/custom_options.sh',
  // PM2_SPELL_CONF_FILE : p.join(DEFAULT_FILE_PATH, 'custom_options.sh'),

  CODE_UNCAUGHTEXCEPTION : 100,
  SUCCESS_EXIT : 0,
  ERROR_EXIT : 1,
  PREFIX_MSG : '\x1B[32mPM2-Spell \x1B[39m',
  PREFIX_MSG_ERR : '\x1B[31mPM2 [ERROR] \x1B[39m',


  ONLINE_STATUS : 'online',
  STOPPED_STATUS : 'stopped',
  STOPPING_STATUS : 'stopping',
  LAUNCHING_STATUS : 'launching',
  ERRORED_STATUS : 'errored',
  ONE_LAUNCH_STATUS : 'one-launch-status',

  };

// var custom_conf = fs.readFileSync(default_conf.PM2_CONF_FILE, 'utf8') || "{}";
// util._extend(default_conf, eval(custom_conf));

module.exports = default_conf;