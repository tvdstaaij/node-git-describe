var _ = require('lodash');
var child_process = require('child_process');
var semver = require('semver');

var self = this;

self.gitDescribe = function(directory, options, cb) {
    if (_.isFunction(options)) {
        cb = options;
        options = {};
    } else if (_.isFunction(directory)) {
        cb = directory;
        directory = undefined;
        options = {};
    }
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

    var resultParser = _.partialRight(self.parseDescription, options);
    var resultHandler = _.partialRight(self.handleProcessResult, resultParser);
    var execFunc = _.isFunction(cb) ?
        child_process.execFile : child_process.spawnSync;
    execFunc = _.partial(execFunc, 'git', arguments, {});

    if (_.isFunction(cb)) {
        execFunc(_.partialRight(resultHandler, cb));
    } else {
        var result = execFunc();
        return resultHandler(result, result.stdout, result.stderr, null);
    }
};

self.handleProcessResult = function(result, stdout, stderr, cb, parser) {
    if (result && result.status !== 0) {
        var code = result.status || result.code;
        var err = new Error('Git returned with status ' + code + ': ' +
            stderr.toString().trim());
        if (_.isFunction(cb)) {
            cb(err);
            return;
        }
        throw err;
    }
    var result = parser(stdout.toString().trim());
    if (_.isFunction(cb)) {
        cb(null, result);
        return;
    }
    return result;
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
        if (output.semver) {
		    output.semverString = output.semver.format();
            if (build)
                output.semverString += '+' + build;
        }
    }
    output.suffix = suffixTokens.join('-');
    output.toString = function() { return output.raw; };
    return output;
};
