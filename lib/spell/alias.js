var spell = require('../spell');
spell.alias('destroy', { resource: 'apps', command: 'destroy' });
spell.alias('unpublish', { resource: 'apps', command: 'destroy' });
spell.alias('deploy', { resource: 'apps', command: 'deploy' });
spell.alias('publish', { resource: 'apps', command: 'deploy' });
spell.alias('list', { resource: 'apps', command: 'list' });
spell.alias('stop', { resource: 'apps', command: 'stop' });
spell.alias('start', { resource: 'apps', command: 'start' });
spell.alias('restart', { resource: 'apps', command: 'restart' });


spell.alias('login', { resource: 'users', command: 'login' });
spell.alias('logout', { resource: 'users', command: 'logout' });