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
        match: 'v[0-9]*',
        customArguments: []
    });
    var description = self.runDescribe(directory, options);
    return self.parseDescription(description, options);
};

self.runDescribe = function(directory, options) {
    var arguments = [];
    if (_.isString(directory))
        arguments = arguments.concat(['-C', directory]);
    arguments = arguments.concat(['describe', '--long', '--dirty', '--always']);
    if (options.requireAnnotated === false)
        arguments.push('--tags');
    if (_.isString(options.match))
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
        dirty: false,
        raw: description,
        hash: null, distance: null, tag: null, semver: null, suffix: null,
        semverString: null
    };
    var tokens = description.split('-');
    var suffixTokens = [];
    if (_.last(tokens) === 'dirty') {
        output.dirty = true;
        suffixTokens.push(tokens.pop());
    }
    output.hash = tokens.pop();
    suffixTokens.unshift(output.hash);
    // Skip this part in the --always fallback case (i.e. no tags found)
    if (!_.isEmpty(tokens)) {
        output.distance = Number(tokens.pop());
        suffixTokens.unshift(output.distance);
        output.tag = tokens.join('-');
        output.semver = semver.parse(output.tag);
        output.semverString = '';
        var build = '';
        var appendDirty = options.dirtySemver && output.dirty;
        if (output.distance || options.longSemver || appendDirty) {
            build = String(output.distance) + '.' + output.hash;
            if (appendDirty)
                build += '.dirty';
        }
        output.semverString = output.tag + (build ? '+' + build : '');
    }
    output.suffix = suffixTokens.join('-');
    output.toString = function() { return output.raw; };
    return output;
};
