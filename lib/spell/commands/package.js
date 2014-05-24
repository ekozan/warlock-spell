var spell = require('../../spell'),
    utile = spell.common;
var package = exports;

package.usage = [
  'The `spell package` command manages the tarballs',
  'which are automatically created by spell',
  'Valid commands are: ',
  '',
  'spell package create',
];

//
// function create (callback)
// #### @callback {function} Continuation to respond to when complete.
// Creates a tarball in the `tmproot` directory for app in the current directory
//
package.create = function (callback) {

  spell.package.get(process.cwd(), function (err, pkg) {
    if (err) {
      return callback(err, true);
    }

    spell.log.info('Creating tarball for ' + pkg.name.magenta);
    spell.package.createTarball(process.cwd(), pkg.version, function (err, ign, file) {
      if (err) {
        return callback(err);
      }

      spell.log.info('Tarball for ' + pkg.name.magenta + ' at ' + file.magenta);
      return callback();
    });
  });
};
