/* eslint-env jquery */
/* eslint-env node */

if (typeof require === 'function') {
    var jsdom = require('jsdom');
    var JSDOM = jsdom.JSDOM;
    var window = new JSDOM('<!DOCTYPE html>').window;
    var $ = require('jquery')(window);
    var lunr = require('lunr');
}

(function() {
    var Search = function(items) {
        this.results = [];
        this.data = {};
        this.index = initializeLunrIndex(items);

        var me = this;
        items.forEach(function(d) {
            me.data[d.title] = d;
        });
    };

    Search.prototype.doSearch = function() {
        var q = $.trim($('#q').val());

        var searchParams = [];

        var mainTerm = '';
        if (q) {
            mainTerm = '*' + q + '*';
        }

        if (!q && searchParams.length === 0) {
            // No search params? Then just show everything.
            $('#all-objects').show();
            return false;
        }

        this.results = this.index.query(function(q) {
            searchParams.forEach(function(param) {
                var k = param[0];
                var v = param[1];
                if (v) {
                    q.term(v.toLowerCase(), { fields: [k] });
                }
            });
            if (mainTerm) {
                q.term(mainTerm.toLowerCase());
                searchParams.push(mainTerm.toLowerCase());
            }
        }).filter(function(result) {
            return Object.keys(result.matchData.metadata).length ===
                searchParams.length;
        });

        var $el = $('#search-results');
        $el.show();
        $('#all-objects').hide();

        var me = this;
        this.results.forEach(function(r) {
            var d = me.data[r.ref];
            var href = '/resources/' + slugify(d.title);

            var $result = $(
                '<div class="search-result">' +
                    '<a href="' + href + '">' +
                    d.title +
                    '</a>' +
                    '</div>'
            );
            $el.append($result);
        });
        return false;
    };

    // https://gist.github.com/mathewbyrne/1280286#gistcomment-2005392
    var slugify = function(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')          // Replace spaces with -
            .replace(/&/g, '-and-')        // Replace & with 'and'
            .replace(/[^\w-]+/g, '')       // Remove all non-word chars
            .replace(/--+/g, '-')          // Replace multiple - with single -
            .replace(/^-+/, '')            // Trim - from start of text
            .replace(/-+$/, '');           // Trim - from end of text
    };

    var initializeLunrIndex = function(items) {
        var idx = lunr(function() {
            this.ref('title');
            this.field('title');
            this.field('body');
            this.field('climate_topics');
            this.field('author');
            this.field('resource_link');

            items.forEach(function(d) {
                this.add(d);
            }, this);
        });

        return idx;
    };

    var clearSearch = function() {
        $('#search-results').empty();
    };

    if (typeof document === 'object') {
        $(document).ready(function() {
            $.getJSON('/resources.json').done(function(items) {
                var search = new Search(items);

                $('#clear-search').click(clearSearch);
                $('#q').keyup(function() {
                    clearSearch();
                    return search.doSearch();
                });

                $('select.dt-date,select.dt-cultural-region,' +
                  'select.dt-source,select.dt-object-use'
                ).change(function() {
                    clearSearch();
                    return search.doSearch();
                });
            });
        });
    }

    if (typeof module !== 'undefined') {
        module.exports = { Search: Search };
    }
})();
