/* eslint-env node */
/* eslint-env mocha */

var assert = require('assert');
var fs = require('fs');

var Search = require('../src/search.js').Search;

var items = JSON.parse(fs.readFileSync('resources.json', 'utf8'));

describe('Search', function() {
    it('can be initialized with an empty array', function() {
        var s = new Search([]);
        assert.strictEqual(s.results.length, 0);
    });

    it('can be initialized with items', function() {
        var s = new Search(items);
        assert.strictEqual(s.results.length, 0);
    });
});

describe('Search.doSearch()', function() {
    it('returns the right elements when empty', function() {
        var s = new Search([]);
        s.doSearch(['abc', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);
    });

    it('returns all elements when given an empty string', function() {
        var s = new Search(items);
        s.doSearch(['', null, null, null, null]);
        assert.strictEqual(s.results.length, items.length);
    });

    it('returns the right elements when there are items', function() {
        var s = new Search(items);
        s.doSearch(['abc', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);

        s.doSearch(['Zoe', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);

        s.doSearch(['zoe', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);

        s.doSearch(['tribal', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);

        s.doSearch(['silk', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);

        s.doSearch(['US Global Change', null, null, null, null]);
        assert.strictEqual(s.results.length, 45);

        s.doSearch(['', null, 'Arctic', null, null]);
        assert.strictEqual(s.results.length, 136);
    });

    it('can search on multiple facets', function() {
        var s = new Search(items);
        s.doSearch(['black', null, 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 0);
    });
});
