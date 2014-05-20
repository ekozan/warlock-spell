var commander = require('commander');
var fs = require('fs');
var path = require('path');
var util = require('util');
var q = require('../scripts/question.js');


var CLI = module.exports = {};
require('colors');


CLI.addServer = function() {

function get_host(){
  q.askOne({ info: '\x1B[32mWarlock server host\x1B[39m', required : true }, function(result){
      q.askOne({ info: '\x1B[32mWarlock Username <warlock>\x1B[39m'}, function(username){
      	q.askOne({ info: '\x1B[32mWarlock Password\x1B[39m', required : true }, function(username){
      
      	});
      });
});
};
get_host();
};