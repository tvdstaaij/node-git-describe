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
        dirtySemver: true,
        longSemver: false,
        requireAnnotated: false,
        match: 'v*',
        customArguments: []
    });
    var description = self.runDescribe(directory, options);
    return self.parseDescription(description, options);
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
            result.stderr.toString().trim());
    return result.stdout.toString().trim();
};

self.parseDescription = function(description, options) {
    var output = {
        dirty: false
    };
    var tokens = description.split('-');
    var suffixTokens = [];
    if (_.last(tokens) === 'dirty') {
        output.dirty = true;
        suffixTokens.push(tokens.pop());
    }
    output.hash = tokens.pop();
    output.distance = Number(tokens.pop());
    suffixTokens = [output.distance, output.hash].concat(suffixTokens);
    output.tag = tokens.join('-');
    output.semver = semver.parse(output.tag);
    output.suffix = suffixTokens.join('-');
    output.raw = description;
    output.semverString = '';
    var build = '';
    var appendDirty = options.dirtySemver && output.dirty;
    if (output.distance || options.longSemver || appendDirty) {
        build = String(output.distance) + '.' + output.hash;
        if (appendDirty)
            build += '.dirty';
    }
    output.semverString = output.tag + (build ? '+' + build : '');
    output.toString = function() { return output.raw; };
    return output;
};
