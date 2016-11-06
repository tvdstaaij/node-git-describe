'use strict';

var _ = require('lodash');
var gitDescribe = require('./lib/git-describe');

module.exports = {

    gitDescribe: function(directory, options, cb) {
        return new Promise(function(resolve, reject) {
            gitDescribe(directory, options, function(err, result) {
                if (err) reject(err); else resolve(result);
                if (_.isFunction(cb)) cb(err, result);
            });
        });
    },

    gitDescribeSync: _.partialRight(gitDescribe, null)

};
