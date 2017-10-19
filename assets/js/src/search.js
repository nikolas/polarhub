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
    var appendWithoutDuplicates = function(array, item) {
        if (array.indexOf(item) < 0) {
            array.push(item);
        }
    };

    var initializeOptions = function(options, $selectEl) {
        options.forEach(function(e) {
            $selectEl.append(
                '<option value="' + e + '">' +
                    e + '</option>');
        });
    };

    var truncate = function(body) {
        var length = 320;
        if (body.length > length) {
            return body.substring(0, length) + '&hellip;';
        } else {
            return body;
        }
    };

    var Search = function(items) {
        this.results = [];
        this.data = {};
        this.index = initializeLunrIndex(items);

        var me = this;
        items.forEach(function(d) {
            me.data[d.title] = d;
        });
    };

    Search.prototype.doSearch = function(params) {
        var mainTerm = '';
        // No search params? Then just show everything by
        // setting '*' if params is empty
        if (params.join('') === '') {
            mainTerm = ['*'];
        } else {
            mainTerm = params[0].split(' ').map(function(x) {
                if (x) {
                    return '*' + x + '*';
                } else {
                    return x;
                }
            });
        }

        var searchParams = [];

        if (params[1]) {
            searchParams.push(['climate_topics',  params[1]]);
        }
        if (params[2]) {
            searchParams.push(['polar_topics',  params[2]]);
        }
        if (params[3]) {
            searchParams.push(['resource_type',  params[3]]);
        }
        if (params[4]) {
            searchParams.push(['audience',  params[4]]);
        }

        var $el = $('#search-results');
        $el.show();
        $('#all-objects').hide();

        this.results = this.index.query(function(q) {
            searchParams.forEach(function(param) {
                var k = param[0];
                var v = param[1];
                if (v) {
                    q.term(v.toLowerCase(), { fields: [k] });
                }
            });
            mainTerm.forEach(function(param) {
                if (param) {
                    q.term(param.toLowerCase());
                    searchParams.push(param.toLowerCase());
                }
            });
        }).filter(function(result) {
            var hasSomeParams = Object.keys(result.matchData.metadata).length ===
                searchParams.length;
            return searchParams.join('') === '*' || hasSomeParams;
        });

        var me = this;
        this.results.forEach(function(r) {
            var d = me.data[r.ref];
            var href = '/resources/' + slugify(d.title);

            var $result = $(
                '<div class="search-result">' +
                    '<a href="' + href + '">' +
                    d.title +
                    '</a>' +
                    '<p>' + truncate(d.body) + '</p>' +
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
            this.field('polar_topics');
            this.field('resource_type');
            this.field('audience');
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
            var path = window.location.pathname.replace(/database\/$/, '');
            $.getJSON(path + 'resources.json').done(function(items) {
                var climateTopics = [];
                var polarTopics = [];
                var resourceType = [];
                var audience = [];
                items.forEach(function(e) {
                    e.climate_topics.forEach(function(t) {
                        if (t) {
                            appendWithoutDuplicates(climateTopics, $.trim(t));
                        }
                    });
                    e.polar_topics.forEach(function(t) {
                        if (t) {
                            appendWithoutDuplicates(polarTopics, $.trim(t));
                        }
                    });
                    e.resource_type.forEach(function(t) {
                        if (t) {
                            appendWithoutDuplicates(resourceType, $.trim(t));
                        }
                    });
                    e.audience.forEach(function(t) {
                        if (t) {
                            appendWithoutDuplicates(audience, $.trim(t));
                        }
                    });
                });

                initializeOptions(
                    climateTopics.sort(), $('select#formClimateTopics'));
                initializeOptions(
                    polarTopics.sort(), $('select#formPolarTopics'));
                initializeOptions(
                    resourceType.sort(), $('select#formResourceType'));
                initializeOptions(
                    audience.sort(), $('select#formAudience'));

                var search = new Search(items);
                search.doSearch(['','','']);

                $('#clear-search').click(clearSearch);
                $('#q').keyup(function() {
                    clearSearch();
                    search.doSearch([
                        $.trim($('#q').val()),
                        $('select#formClimateTopics').val(),
                        $('select#formPolarTopics').val(),
                        $('select#formResourceType').val(),
                        $('select#formAudience').val()
                    ]);
                });

                $('select#formClimateTopics,select#formPolarTopics,select#formResourceType,select#formAudience')
                    .change(function() {
                        clearSearch();
                        search.doSearch([
                            $.trim($('#q').val()),
                            $('select#formClimateTopics').val(),
                            $('select#formPolarTopics').val(),
                            $('select#formResourceType').val(),
                            $('select#formAudience').val()
                        ]);
                    });
            });
        });
    }

    if (typeof module !== 'undefined') {
        module.exports = { Search: Search };
    }
})();
