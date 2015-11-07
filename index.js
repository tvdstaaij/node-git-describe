var _ = require('lodash');
var mainFunction = require('./lib/git-describe').gitDescribe;

module.exports = {
    gitDescribe: mainFunction,
    gitDescribeSync: _.partialRight(mainFunction, null)
};
