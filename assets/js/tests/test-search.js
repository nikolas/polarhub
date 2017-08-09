/* eslint-env node */
/* eslint-env mocha */

var assert = require('assert');
var Search = require('../src/search.js').Search;

describe('Search', function() {
    it('can be initialized with an empty array', function() {
        var s = new Search([]);
        assert.strictEqual(s.results.length, 0);
    });
});
