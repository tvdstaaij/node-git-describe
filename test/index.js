'use strict';

var nodeVersion = process.version.substring(1).split('.');
var exampleTestsOptional =
    (typeof process.env.EXAMPLE_TESTS_OPTIONAL !== "undefined");

require('./git-describe');

if (Number(nodeVersion[0]) >= 6 || !exampleTestsOptional) {
    require('./examples');
}
