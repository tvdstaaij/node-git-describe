'use strict';

/* Blackbox test for the gitDescribe and gitDescribeSync functions
 * using operations on a real git repository.
 * Requires a git binary available in the executable path.
 * The test-repo directory must be writable.
 */

var _ = require('lodash');
var path = require('path');
var should = require('chai').should();
var expect = require('chai').expect;
var assert = require('chai').assert;
var TestRepo = require('./lib/test-repo');
var gitDescribe = require('..').gitDescribe;
var gitDescribeSync = require('..').gitDescribeSync;

var repoDir = path.join(__dirname, 'test-repo');
var repo = new TestRepo(repoDir);

before(function() {
    repo.clean();
});

after(function() {
    repo.clean();
});

describe('gitDescribe', function() {

    it('should fail on an uninitialized repo', function() {
        var fsRoot = __dirname.substring(0, __dirname.indexOf(path.sep) + 1);
        return gitDescribe(fsRoot)
            .then(_.ary(assert.fail, 0), function(err) {
                err.message.toLowerCase().should.include('not a git repo');
            });
    });

    it('should fail on a fresh repo', function() {
        repo.init();
        return gitDescribe(repoDir)
            .then(_.ary(assert.fail, 0), function(err) {
                err.message.toLowerCase().should.include('bad revision');
            });
    });

    it('should fail without git', function() {
        repo.init();
        var oldPath = process.env.PATH;
        oldPath.should.not.be.empty;
        process.env.PATH = '';
        return gitDescribe(repoDir)
            .then(_.ary(assert.fail, 0), function(err) {
                err.message.toLowerCase().should.include('git executable');
                err.message.toLowerCase().should.include('path');
            })
            .then(function() {
                process.env.PATH = oldPath;
            });
    });

    it('should work without a tag', function() {
        repo.changeData();
        repo.commit();
        return gitDescribe(repoDir)
            .then(function(gitInfo) {
                gitInfo.hash.should.have.length.at.least(7);
                gitInfo.raw.should.equal(gitInfo.hash);
                gitInfo.suffix.should.equal(gitInfo.hash);
                gitInfo.dirty.should.be.false;
                expect(gitInfo.distance).to.be.null;
                expect(gitInfo.tag).to.be.null;
                expect(gitInfo.semver).to.be.null;
                expect(gitInfo.semverString).to.be.null;
            });
    });

    it('should work with an annotated tag', function() {
        repo.tagAnnotated('v1.2.3');
        return gitDescribe(repoDir)
            .then(function(gitInfo) {
                gitInfo.dirty.should.be.false;
                gitInfo.tag.should.equal('v1.2.3');
                gitInfo.semver.minor.should.equal(2);
                gitInfo.semverString.should.equal('1.2.3');
                gitInfo.distance.should.equal(0);
            });
    });

    it('should use a lightweight tag unless requireAnnotated is in effect', function() {
        repo.changeData();
        repo.commit();
        repo.tagLightweight('v1.2.4');
        return gitDescribe(repoDir)
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('v1.2.4');
                gitInfo.distance.should.equal(0);

                return gitDescribe(repoDir, {requireAnnotated: true});
            })
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('v1.2.3');
                gitInfo.distance.should.equal(1);
            });
    });

    it('should skip a tag that does not match the format regexp', function() {
        return gitDescribe(repoDir, {match: '*3'})
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('v1.2.3');
            });
    });

    it('should recognize dirty state', function() {
        repo.changeData();
        return gitDescribe(repoDir)
            .then(function(gitInfo) {
                gitInfo.dirty.should.be.true;
                gitInfo.tag.should.equal('v1.2.4');
            });
    });

    it('should accept a custom dirty mark', function() {
        repo.changeData();
        return gitDescribe(repoDir, {dirtyMark: '-foo.bar'})
            .then(function(gitInfo) {
                gitInfo.dirty.should.be.true;
                var endsWithDirtyMark = _.partial(_.endsWith, _, '.foo.bar');
                gitInfo.semverString.should.satisfy(endsWithDirtyMark);
            });
    });

    it('should modify semver formatting when longSemver and dirtySemver are not default', function() {
        repo.changeData();
        repo.commit();
        repo.tagAnnotated('v2.0.0');
        repo.changeData();
        return gitDescribe(repoDir, {longSemver: true, dirtySemver: false})
            .then(function(gitInfo) {
                gitInfo.dirty.should.be.true;
                var template = /^2\.0\.0\+0\.g[a-f0-9]{7,}$/;
                gitInfo.semverString.should.match(template);
            });
    });

    it('should present the short describe when long is false', function() {
        repo.changeData();
        repo.commit();
        repo.tagAnnotated('v2.0.1');
        return gitDescribe(repoDir, {long: false})
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('v2.0.1');
                gitInfo.raw.should.equal('v2.0.1');
                gitInfo.suffix.should.equal('');
                gitInfo.semverString.should.equal('2.0.1');
            });
    });

    it('should present the short describe and long semver when long is false but longSemver is true', function() {
        repo.changeData();
        repo.commit();
        repo.tagAnnotated('v2.0.2');
        return gitDescribe(repoDir, {long: false, longSemver: true})
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('v2.0.2');
                gitInfo.raw.should.equal('v2.0.2');
                gitInfo.suffix.should.equal('');
                var template = /^2\.0\.2\+0\.g[a-f0-9]{7,}$/;
                gitInfo.semverString.should.match(template);
            });
    });

    it('should work with a tag that is not a valid semver', function() {
        repo.changeData();
        repo.commit();
        repo.tagAnnotated('v3b');
        return gitDescribe(repoDir)
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('v3b');
                expect(gitInfo.semver).to.be.null;
                gitInfo.semverString.should.equal('');
            });
    });

    it('should accept any tag when format match regexp is disabled', function() {
        repo.tagAnnotated('foobar');
        return gitDescribe(repoDir, {match: false})
            .then(function(gitInfo) {
                gitInfo.tag.should.equal('foobar');
            });
    });

    it('should be able to resolve both a callback and a promise', function(cb) {
        var promise = gitDescribe(repoDir, function(err) {
            if (err)
                cb(err);
            else
                promise.then(_.ary(cb, 0)).catch(cb);
        });
    });

    it('should work without arguments', function() {
        process.chdir(repoDir);
        return gitDescribe();
    });

    it('should work with just a callback', function(cb) {
        gitDescribe(cb);
    });

});

describe('gitDescribeSync', function() {

    it('should return all info synchronously', function() {
        gitDescribeSync(repoDir, {requireAnnotated: true})
            .should.have.all.keys([
                'dirty', 'hash', 'distance', 'tag', 'semver', 'semverString',
                'raw', 'suffix', 'toString'
            ]);
    });

});
