/* eslint-env jquery */
/* globals lunr */

(function() {
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

    var appendWithoutDuplicates = function(array, item) {
        if (array.indexOf(item) < 0) {
            array.push(item);
        }
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

    var initializeOptions = function(options, $selectEl) {
        options.forEach(function(e) {
            $selectEl.append(
                '<option value="' + e + '">' +
                    e + '</option>');
        });
    };

    // This is the category filter data to be
    // populated with the JSON.
    var categories = {
        dates: [],
        culturalRegions: [],
        sources: [],
        objectUses: []
    };

    var results = [];

    var data = {};
    var index;
    $.getJSON('/resources.json').done(function(items) {
        index = initializeLunrIndex(items);
        items.forEach(function(d) {
            data[d.title] = d;
        });
    });

    var doSearch = function() {
        var q = $.trim($('#q').val());

        var searchParams = [];

        var mainTerm = '';
        if (q) {
            mainTerm = '*' + q + '*';
            searchParams.push(mainTerm);
        }

        if (searchParams.length === 0) {
            // No search params? Then just show everything.
            $('#all-objects').show();
            return false;
        }

        results = index.query(function(q) {
            q.term(mainTerm);
            searchParams.forEach(function(param) {
                var k = param[0];
                var v = param[1];
                q.term(v, { fields: [k] });
            });
        }).filter(function(result) {
            return Object.keys(result.matchData.metadata).length ===
                searchParams.length;
        });

        var $el = $('#search-results');
        $el.show();
        $('#all-objects').hide();

        results.forEach(function(r) {
            var d = data[r.ref];
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

    var clearSearch = function() {
        $('#search-results').empty();
    };

    $(document).ready(function() {
        $('#search').click(doSearch);
        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            clearSearch();
            return doSearch();
        });

        $('select.dt-date,select.dt-cultural-region,' +
          'select.dt-source,select.dt-object-use'
        ).change(function() {
            clearSearch();
            return doSearch();
        });
    });
})();
