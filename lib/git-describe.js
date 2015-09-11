var _ = require('lodash');
var semver = require('semver');
var spawnSync = require('child_process').spawnSync;

var self = this;

self.gitDescribe = function(directory, options) {
    if (!_.isString(directory) && _.isObject(directory)) {
        options = directory;
        directory = undefined;
    }
    options = _.defaults({}, options, {
        dirty: true,
        long: false,
        requireAnnotated: false,
        match: 'v*',
        customArguments: []
    });

    var description = self.runDescribe(directory, options);
    console.log(description);
};

self.runDescribe = function(directory, options) {
    var arguments = [];
    if (_.isString(directory))
        arguments = arguments.concat(['-C', directory]);
    arguments = arguments.concat(['describe', '--long', '--dirty']);
    if (options.requireAnnotated === false)
        arguments.push('--tags');
    if (_.isString(options.filter))
        arguments = arguments.concat(['--match', options.match]);
    if (_.isArray(options.customArguments))
        arguments = arguments.concat(options.customArguments);
    var result = spawnSync('git', arguments);
    if (result.status !== 0)
        throw new Error('Git returned with status ' + result.status + ': ' +
            result.stderr.toString());
    return result.stdout.toString();
};
