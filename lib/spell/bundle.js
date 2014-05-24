var fs = require('fs'),
    path = require('path'),
    existsSync = fs.existsSync || path.existsSync,
    util = require('util'),
    punycode = require('punycode'),
    zlib = require('zlib'),
    async = require('flatiron').common.async,
    semver = require('semver'),
    fstream = require('fstream'),
    ProgressBar = require('progress'),
    fstreamNpm = require('fstream-npm'),
    tar = require('tar'),
    ladder = require('ladder'),
	  spell = require('../spell');

var bundle = exports;




bundle.get = function (dir, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  bundle.read(dir, function (err, pkg) {
    if (err) {

      if (err.toString() === "Error: Invalid app.json file") {
        spell.log.error(err.toString());
        return callback(
          'Please make sure ' + (path.join(dir, '/app.json')).grey + ' is valid JSON',
          false,
          false
        );
      }
      //return bundle.create(dir, callback);
      return callback(
          'Please make sure ' + (path.join(dir, '/app.json')).grey + ' exist',
          false,
          false
      );
    }

    bundle.validate(pkg, dir, options, function (err, updated) {
      return err ? callback(err) : callback(null, updated);
    });
  });
};


bundle.read = function (dir, callback) {
  var file = path.resolve(path.join(dir, 'app.json'));

  fs.readFile(file, function (err, data) {
    if (err) {
      return callback(err);
    }

    data = data.toString();

    if (!data.length) {
      return callback(new Error('app.json is empty'));
    }

    try {
      data = JSON.parse(data.toString());
    }
    catch (ex) {
      return callback(new Error('Invalid app.json file'));
    }

    callback(null, data);
  });
};

bundle.tryRead = function (dir, callback, success) {
  bundle.read(dir, function (err, pkg) {
    return err ? callback(new Error('No bundle found at ' + (dir + '/app.json').grey), true) : success(pkg);
  });
};

bundle.write = function (pkg, dir, create, callback) {
  function doWrite(err, result) {
    if (err) {
      return cb(err);
    }
    if (!result) {
      return create ? bundle.create(dir, callback) : callback(new Error('Save app.json cancelled.'));
    }

    fs.readFile(path.resolve(path.join(dir, 'app.json')), function (e, data) {
      var offset = data ? ladder(data.toString()) : 2;
      fs.writeFile(path.join(dir, 'app.json'), JSON.stringify(pkg, null, offset) + '\n', function (err) {
        return err ? callback(err) : callback(null, pkg, dir);
      });
    });
  }

  if (!callback) {
    callback = create;
    create = null;
  }

  spell.log.warn('About to write ' + path.join(dir, 'app.json').magenta);

  spell.inspect.putObject(pkg, 2);

  return spell.prompt.confirm('Is this ' + 'ok?'.green.bold, { default: 'yes'}, doWrite);
};

bundle.validate = function (pkg, dir, options, callback) {

  if (!callback) {
    callback = options;
    options = {};
  }

  var properties = bundle.properties(dir),
      missing = [],
      invalid = [];

  function checkProperty (desc, next) {
    var nested = desc.name.split('.'),
        value = pkg[nested[0]];

    if (nested.length > 1 && value) {
      value = value[nested[1]];
    }

    // Handle missing values
    if (!value) {
      missing.push(desc);
    }

    // handle invalid values
    function isValid(desc) {
      if (desc.validator) {
        if (desc.validator instanceof RegExp) {
          return !desc.validator.test(value);
        }

        return !desc.validator(value);
      }
      return false;
    }

    if (value && isValid(desc)) {

      if (nested.length > 1) {
        delete pkg[nested[0]][nested[1]];
      }
      else {
        delete pkg[nested[0]];
      }

      invalid.push(desc);
    }

    next();
  }

  async.forEach(properties, checkProperty, function () {

    if (missing.length <= 0 && invalid.length <= 0) {
      return callback(null, pkg);
    }

    var help,
        missingNames = missing.map(function (prop) {
          return ' ' + (prop.message || prop.name).grey;
        }),
        invalidNames = invalid.map(function (prop) {
          return ' ' + (prop.message || prop.name).grey;
        });

    help = [
      ''
    ];

    if (missingNames.length) {
      help = help.concat([
        'The app.json file is missing required fields:',
        '',
        missingNames.join(', '),
        ''
      ]);
    }

    if (invalidNames.length) {
      help = help.concat([
        'The app.json file has invalid required fields:',
        '',
        invalidNames.join(', '),
        ''
      ]);
    }

    help = help.concat([
      'Prompting user for required fields.',
      'Press ^C at any time to quit.',
      ''
    ]);

    help.forEach(function (line) {
      spell.log.warn(line);
    });

    fillPackage(pkg, dir, function (err, pkg) {
      if (err) {
        return callback(err);
      }
     bundle.write(pkg, dir, true, function (err, pkg) {
        if (err) {
          return callback(err);
        }
        return callback(null, pkg);
     });
    });
  });
};



bundle.createTarball = function (dir, version, callback) {
  if (!callback) {
    callback = version;
    version = null;
  }

  bundle.read(dir, function (err, pkg) {
    if (err) {
      return callback(err);
    }

    if (dir.slice(-1) === '/') {
      dir = dir.slice(0, -1);
    }

    var name = [spell.config.get('username'), pkg.name, version || pkg.version].join('-') + '.tgz',
        tarball = path.join(spell.config.get('tmproot'), name);

    fstreamNpm({
      path: dir,
      ignoreFiles: ['.spellignore', '.npmignore', '.gitignore', 'package.json']
    })
      .on('error', callback)
      .pipe(tar.Pack())
      .on('error', callback)
      .pipe(zlib.Gzip())
      .on('error', callback)
      .pipe(fstream.Writer({ type: "File", path: tarball }))
      .on('close', function () {
        callback(null, pkg, tarball);
      });
  });
};


bundle.properties = function (dir) {
  return [
    {
      name: 'name',
      unique: true,
      required:true,
      message: 'Application name',
      validator: /^(?!\.)(?!_)(?!node_modules)(?!favicon.ico)[^\/@\s\+%:\n]+$/,
      warning: 'The application name must follow the rules for npm package names.\n'+
      ' They must not start with a \'.\' or \'_\', contain any whitespace \n'+
      ' characters or any of the following characters(between quotes): "/@+%:". \n'+
      ' Additionally, the name may not be \'node_modules\' or \'favicon.ico\'.',
      default: path.basename(dir)
    },
    {
      name: 'subdomain',
      unique: true,
      required:true,
      message: 'Subdomain name',
      warning: 'The subdomain must follow the rules for ARPANET host names. They must\n'+
      ' start with a letter, end with a letter or digit, and have as interior\n'+
      ' characters only letters, digits, and hyphen. There are also some\n'+
      ' restrictions on the length. Labels must be 63 characters or less.\n'+
      ' There are a few exceptions, underscores may be used as an interior \n'+
      ' character and unicode characters may be used that are supported under\n'+
      ' punycode.',
      validator: function(s){
        var reValidSubdomain = /^[a-zA-Z]$|^[a-zA-Z][a-zA-Z\d]$|^[a-zA-Z][\w\-]{1,61}[a-zA-Z\d]$/;
        if(s.indexOf('.') !== -1) { // We will support multiple level subdomains this for now warn user...
          spell.log.warn("**WARNING** Do not use multiple level subdomains!");
          var subdomainNames = s.split('.'),
              names = subdomainNames.map(punycode.toASCII);
          return !names.some(function(name){return !reValidSubdomain.test(name);});
        } else {
          return reValidSubdomain.test(punycode.toASCII(s));
        }
      },
      help: [
        '',
        'The ' + 'subdomain '.grey + 'is where the app will reside',
        'The app will then become accessible at: http://' + 'subdomain'.grey + '.' + spell.config.get('deploy-sub-domain'),
        ''
      ],
      default: spell.config.get('username') + '-' + path.basename(dir)
    },
    {
      name: 'engines',
      message: 'Enigne',
      unique: false,
      required:true,
      conform: function (engine) {
         if (~['node', 'php', 'ruby', 'python'].indexOf(engine)) {
            return true;
         }else{
            return false;
         }
      },
      warning: 'Enigne not valid available :' + 'node10 | node9 | php | java | python'.magenta,
      default: 'node 0.10.x'
    },
    {
      name: 'scripts.start',
      message: 'Starter Stript',
      conform: function (script) {

        var split = script.split(' ');
        if (~['node', 'coffee'].indexOf(split[0])) {
          script = split.slice(1).join(' ');
        }

        try {
          fs.statSync(path.join(dir, script));
          return true;
        }
        catch (ex) {
          return false;
        }
      },
      warning: 'Start script was not found in ' + dir.magenta,
      default: searchStartScript(dir)
    },
    {
      name: 'version',
      message: 'Package version',
      unique: false,
      conform: semver.valid,
      default: '0.0.0'
    }
  ];
};

function searchStartScript(dir) {
  var node_scripts = ['server', 'app', 'index', 'bin/server'],
      php_scripts = ['public.php', 'public/index.php', 'index.php'],
      script,
      i;

  for (i in node_scripts) {
    script = path.join(dir, node_scripts[i]);
    if (existsSync(script)) {
      return 'node ' + node_scripts[i];
    }
    else if (existsSync(script + '.js')) {
      return 'node ' + node_scripts[i] + '.js';
    }
    else if (existsSync(script + '.coffee')) {
      return 'coffee ' + node_scripts[i] + '.coffee';
    }
  }

  for (i in php_scripts) {
    script = path.join(dir, php_scripts[i]);
    if (existsSync(script)) {
      return php_scripts[i];
    }
  }
}


function fillPackage (base, dir, callback) {
  base = base || {};
  var subdomain, descriptors, missing;

  missing = ['name','engines' ,'subdomain', 'version'].filter(function (prop) {
    return !base[prop]
  });

  if (!(base.scripts && base.scripts.start)) {
    missing.push('scripts.start');
  }

  descriptors = bundle.properties(dir).filter(function (descriptor) {
    return missing.indexOf(descriptor.name) !== -1;
  });

  spell.prompt.addProperties(base, descriptors, function (err) {
    if(err){
      spell.log.error('Unable to add properties to package description.');
      return callback(err);
    }
      return callback(null, base);
  });
  // todo -> check name available ! 
}
