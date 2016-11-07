'use strict';

/* Tests the examples given in the readme.
 * Requires basic ES6 support and the optional semver module.
 * Must be run from the module's git repository.
 */

const _ = require('lodash');
const path = require('path');
const should = require('chai').should();
const semver = require('semver');
const {gitDescribe, gitDescribeSync} = require('..');

describe('Readme examples', () => {

    it('should target working directory', () => {
        process.chdir(path.normalize(path.join(__dirname, '..')));
        gitDescribeSync().should.satisfy(_.isPlainObject);
    });

    it('should target a specific directory', () => {
        process.chdir(path.normalize(path.join(__dirname, '..', '..')));
        gitDescribeSync(__dirname).should.satisfy(_.isPlainObject);
    });

    it('should accept options', () => {
        const gitInfo = gitDescribeSync(__dirname, {
            longSemver: true,
            dirtySemver: false
        });
        gitInfo.semverString.should.include(gitInfo.hash);
    });

    it('should accept custom arguments', () => {
        process.chdir(path.normalize(path.join(__dirname, '..')));
        const gitInfo = gitDescribeSync({
            customArguments: ['--abbrev=16']
        });
        gitInfo.hash.should.have.lengthOf(17);
    });

    it('should work with a promise', () => {
        const promise = gitDescribe(__dirname);
        promise.should.be.instanceof(Promise);
        return promise
            .then((result) => result.should.satisfy(_.isPlainObject));
    });

    it('should work with a callback', (cb) => {
        gitDescribe(__dirname, (err, gitInfo) => {
            if (err) {
                cb(err);
            } else {
                gitInfo.should.satisfy(_.isPlainObject);
                cb();
            }
        });
    });

    it('should return all specified fields', () => {
        const gitInfo = gitDescribeSync(__dirname);
        gitInfo.hash.should.be.a('string');
        gitInfo.hash.should.not.be.empty;
        gitInfo.tag.should.be.a('string');
        gitInfo.tag.should.not.be.empty;
        gitInfo.raw.should.be.a('string');
        gitInfo.raw.should.not.be.empty;
        gitInfo.semver.should.be.instanceof(semver);
        gitInfo.semverString.should.be.a('string');
        gitInfo.semverString.should.not.be.empty;
        gitInfo.dirty.should.be.a('boolean');
        gitInfo.distance.should.satisfy(_.isInteger);
        String(gitInfo).should.equal(gitInfo.raw);
    });

});
