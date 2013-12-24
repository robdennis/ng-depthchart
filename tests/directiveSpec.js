'use strict';

describe('ng-depthchart', function() {

    beforeEach(function() {
        module('ng-depthchart');
    });

    describe('ZipService', function() {
        // javascript implementation of a python-like "zip" function
        // http://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
        var zipService;
        beforeEach(inject(function(ZipService) {
            zipService = ZipService;
        }));

        it('should handle an arbitrary number of arrays to zip, with arbitrary objects in the array', function() {
            expect(zipService.longest(
                [1, 2, 3],
                ['a', 'b', 'c']
            )).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);

            expect(zipService.longest(
                [1, 2, 3],
                ['a', 'b', 'c'],
                [true, false, true]
            )).toEqual([[1, 'a', true], [2, 'b', false], [3, 'c', true]]);

            expect(zipService.longest(
                [1, 2, 3],
                ['a', 'b', 'c'],
                [true, false, true],
                [{test: 1}, {test: 2}, {test: 3}]
            )).toEqual([
                    [1, 'a', true, {test: 1}],
                    [2, 'b', false, {test: 2}],
                    [3, 'c', true, {test: 3}]
                ]);
        });
        it('should handle mismatched array lengths; and can be called normally or with apply', function() {
            var expected = [[1, 'a'], [2, 'b'], [3, undefined]];
            expect(zipService.longest(
                [1, 2, 3],
                ['a', 'b']
            )).toEqual(expected);

            expect(zipService.longest.apply(
                this, [[1, 2, 3], ['a', 'b']])
            ).toEqual(expected)
        });
    });

    describe('depth-chart', function() {
        var element, compile, scope;
        var nbspChar = '&nbsp;';
        var sameRows, sameRowsObjects, differentRows, differentRowsObjects;

        beforeEach(function() {
            this.addMatchers({
                toHaveTableMatchContent: function(expectedValuesByRowThenCell, table) {

                },
                toMatchDimension: function(length, height) {
                    var notText; // used for crafting the right failure text later
                    var table = getCompiledTable(this.actual);
                    var rows = table.find('tr');
                    var actualHeight = rows.length;
                    var actualWidths = [];
                    angular.forEach(rows, function(row) {
                        // don't differentiate header rows from normal rows
                        var elementRow = angular.element(row);
                        actualWidths.push(elementRow.find('th').length +
                            elementRow.find('td').length);
                    });

                    notText = this.isNot ? '': 'not ';
                    this.message = function() {
                        return notText + 'all row-widths are equal: ' + angular.mock.dump(actualWidths);
                    };

                    for (var i=0; i<actualWidths.length; i++) {
                        // for-loop allows us to return from here if we need to short-circuit
                        if (actualWidths[i] !== actualWidths[0]) {
                            return false;
                        }
                    }

                    notText = 'to not have ';
                    this.message = function() {
                        return 'expected ' + notText + 'a ' + height+' row and ' + length + ' column table; ' +
                            "got " + actualHeight + " and " + actualWidths[0];
                    };
                    return actualHeight === height && actualWidths[0] === length;
                },

                toMatchText: function(expectedValuesByRowThenCell, template) {
                    // this is going to assume that the dimensions match up with expectations
                    var table = getCompiledTable(this.actual, template);

                    return matchesExpectedContent.apply(this, [expectedValuesByRowThenCell, table]);
                },

                toHaveClass: function(cls) {
                    this.message = function() {
                        return "Expected '" + angular.mock.dump(this.actual) + "' to have class '" + cls + "'.";
                    };

                    return angular.element(this.actual).hasClass(cls)
                }
            });
        });

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope;
            compile = $compile;
            sameRows = [
                {header: 'stuff', data: ['foo', 'bar', 'baz']},
                {header: 'stuff2', data: ['foo', 'bar', 'baz']}
            ];

            sameRowsObjects = [
                {header: 'stuff', data: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]},
                {header: 'stuff2', data: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]}
            ];

            differentRows = [
                {header: 'stuff', data: ['foo', 'bar', 'baz', 'bax']},
                {header: 'stuff2', data: ['foo', 'bar', 'baz']}
            ];

            differentRowsObjects = [
                {header: 'stuff', data: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}, {name: 'bax'}]},
                {header: 'stuff2', data: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]}
            ];
        }));

        var getCompiledTable = function(data, template, classes) {
            var templateParam = template ? ' display-template="template"' : '';
            var classParam = classes ? ' additional-classes="classes"' : '';
            scope.subLists = data;
            scope.template = template;
            scope.classes = classes;
            element = angular.element(
                // wrapping with div is needed if you're compiling in a link function apparently
                '<div>' +
                    // only have the template / classes parameter passed to the depth chart if it's set
                    '<depth-chart data="subLists"'+ templateParam + classParam +'></depth-chart>' +
                    '</div>'
            );
            compile(element)(scope);
            // by experimentation, it appears as if this is necessary, but it's unclear why
            scope.$apply();
            return element;
        };

        var matchesExpectedContent = function(expectedValuesByRowThenCell, table) {
            table = table || this.actual;
            var rows = table.find('tr');
            // for loops so we can return early
            // don't collect header rows, so start at 1
            if (rows.length - 1 !== expectedValuesByRowThenCell.length) {
                return false;
            }
            for (var i=1; i<rows.length; i++) {
                var cells = angular.element(rows[i]).find('td');
                for (var j=0; j<cells.length; j++) {
                    var actualCell = angular.element(cells[j]).html();
                    var expectedCell = expectedValuesByRowThenCell[i-1][j];
                    if ( actualCell !== expectedCell) {
                        this.message = function() {
                            return ("mismatched values at row "+(i-1)+" and column "+j+". '" +
                                angular.mock.dump(actualCell) + "' != '" +
                                angular.mock.dump(expectedCell) + "'.");
                        };

                        return false;
                    }
                }
            }

            return true;
        };


        it('can make a 1-column table', function() {
            expect([sameRows[0]]).toMatchDimension(1, 4); // 3 rows plus a header row
        });

        it('can make a 2-column table with same lengths', function() {
            expect(sameRows).toMatchDimension(2, 4);
        });

        it('can make a 2-column table with different lengths', function() {
            expect(differentRows).toMatchDimension(2, 5);
        });

        it('defaults to showing the original value', function() {
            expect(sameRows).toMatchText([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ]);

            expect(differentRows).toMatchText([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz'],
                ['bax', nbspChar]
            ]);
        });

        it('can accept an arbitrary html string, with scope variables', function() {
            expect(differentRowsObjects).toMatchText([
                ['<b class="ng-binding">foo</b>', '<b class="ng-binding">foo</b>'],
                ['<b class="ng-binding">bar</b>', '<b class="ng-binding">bar</b>'],
                ['<b class="ng-binding">baz</b>', '<b class="ng-binding">baz</b>'],
                ['<b class="ng-binding">bax</b>', '<b class="ng-binding"></b>']
            ], '<b>{{item.name}}</b>');
        });

        it('can accept a template "unknown" scope variable', function() {
            expect(sameRows).toMatchText([
                [nbspChar, nbspChar],
                [nbspChar, nbspChar],
                [nbspChar, nbspChar]
            ], '{{ unknown || "&nbsp;" }}');
        });

        it("can accept a template that's just a the value", function() {
            expect(sameRows).toMatchText([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ], '{{ item || "&nbsp;" }}');
        });

        it("can accept a template that's an attribute access", function() {
            expect(sameRowsObjects).toMatchText([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ], '{{ item.name || "&nbsp;" }}');

            expect(differentRowsObjects).toMatchText([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz'],
                ['bax', nbspChar]
            ], '{{ item.name || "&nbsp;" }}');

        });

        it("can accept a template that's an unknown attribute access", function() {
            expect(sameRowsObjects).toMatchText([
                [nbspChar, nbspChar],
                [nbspChar, nbspChar],
                [nbspChar, nbspChar]
            ], '{{ item.unknown || "&nbsp;" }}');

            expect(differentRowsObjects).toMatchText([
                [nbspChar, nbspChar],
                [nbspChar, nbspChar],
                [nbspChar, nbspChar],
                [nbspChar, nbspChar]
            ], '{{ item.unknown || "&nbsp;" }}');
        });

        it('can set custom classes', function() {
            var table = getCompiledTable(
                [sameRowsObjects[0]], undefined, ['{{ item.name }}']
            );

            var cells = table.find('td');
            expect(cells[0]).toHaveClass('depth-chart-cell');
            expect(cells[0]).not.toHaveClass('unknown');
            expect(cells[0]).toHaveClass('foo');
            expect(cells[0]).not.toHaveClass('bar');
            expect(cells[0]).not.toHaveClass('baz');
            expect(cells[1]).toHaveClass('depth-chart-cell');
            expect(cells[1]).toHaveClass('bar');
            expect(cells[1]).not.toHaveClass('foo');
            expect(cells[1]).not.toHaveClass('baz');
            expect(cells[2]).toHaveClass('depth-chart-cell');
            expect(cells[2]).toHaveClass('baz');
            expect(cells[2]).not.toHaveClass('foo');
            expect(cells[2]).not.toHaveClass('bar');
        });

        it('can update with new information', function() {
            element = angular.element(
                // wrapping with div is needed if you're compiling in a link function apparently
                '<div>' +
                    '<depth-chart data="subLists"></depth-chart>' +
                    '</div>'
            );
            compile(element)(scope);

            scope.subLists = sameRows;
            // don't know if this is actually necessary?
            scope.$digest();
            expect(matchesExpectedContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ], element)).toBeTruthy();

            scope.subLists = differentRows;
            // there's new data now
            scope.$apply();
            expect(matchesExpectedContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz'],
                ['bax', nbspChar]
            ], element)).toBeTruthy();
        })

    });
});
