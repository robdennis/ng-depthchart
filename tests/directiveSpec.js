'use strict';

describe('ng-depthchart', function() {

    beforeEach(function() {
        module('ng-depthchart');
    });

    var globalMatchers = {
        matchesExpectedContent: function(expectedValuesByRowThenCell, table) {
            table = table || this.actual;
            var rows = table.find('tr');
            // for-loops so we can return early
            // don't collect header rows, so start at 1
            if (rows.length - 1 !== expectedValuesByRowThenCell.length) {
                return false;
            }
            for (var i=1; i<rows.length; i++) {
                var cells = angular.element(rows[i]).find('td');
                for (var j=0; j<cells.length; j++) {
                    var actual = angular.element(cells[j]).html();
                    var expected = expectedValuesByRowThenCell[i-1][j];
                    if (actual !== expected) {
                        this.message = function() {
                            return ("mismatched values at row "+(i-1)+" and column "+j+". '" +
                                angular.mock.dump(actual) + "' != '" +
                                angular.mock.dump(expected) + "'.");
                        };

                        return false;
                    }
                }
            }
            return true;
        }
    };

    beforeEach(function() {
       this.addMatchers(globalMatchers);
    });

    describe('depth-chart dimensions and templates', function() {
        var element, compile, scope;
        var sameRows, sameRowsObjects, differentRows, differentRowsObjects;

        beforeEach(function() {
            this.addMatchers({
                toMatchDimension: function(length, height) {
                    var notText; // used for crafting the right failure text later

                    scope.providedData = this.actual;
                    var table = angular.element('<div><depth-chart data="providedData"></depth-chart></div>');
                    compile(table)(scope);
                    // our table element has now been rendered
                    scope.$apply();

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

                toMatchContent: function(expectedValuesByRowThenCell, template) {
                    // this is going to assume that the dimensions match up with expectations

                    var templateParam = template ? ' display-template="template"' : '';
                    scope.providedData = this.actual;
                    scope.template = template;
                    var table = angular.element(
                        // only include the template param if it's defined
                        '<div><depth-chart data="providedData"'+ templateParam + '></depth-chart></div>'
                    );
                    compile(table)(scope);
                    scope.$apply();

                    return globalMatchers.matchesExpectedContent.apply(this, [expectedValuesByRowThenCell, table]);
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
            expect(sameRows).toMatchContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ]);

            expect(differentRows).toMatchContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz'],
                ['bax', '&nbsp;']
            ]);
        });

        it('can accept an arbitrary html string, with scope variables', function() {
            expect(differentRowsObjects).toMatchContent([
                ['<b class="ng-binding">foo</b>', '<b class="ng-binding">foo</b>'],
                ['<b class="ng-binding">bar</b>', '<b class="ng-binding">bar</b>'],
                ['<b class="ng-binding">baz</b>', '<b class="ng-binding">baz</b>'],
                ['<b class="ng-binding">bax</b>', '<b class="ng-binding"></b>']
            ], '<b>{{item.name}}</b>');
        });

        it('can accept a template "unknown" scope variable', function() {
            expect(sameRows).toMatchContent([
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;']
            ], '{{ unknown || "&nbsp;" }}');
        });

        it("can accept a template that's just a the value", function() {
            expect(sameRows).toMatchContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ], '{{ item || "&nbsp;" }}');
        });

        it("can accept a template that's an attribute access", function() {
            expect(sameRowsObjects).toMatchContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ], '{{ item.name || "&nbsp;" }}');

            expect(differentRowsObjects).toMatchContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz'],
                ['bax', '&nbsp;']
            ], '{{ item.name || "&nbsp;" }}');

        });

        it("can accept a template that's an unknown attribute access", function() {
            expect(sameRowsObjects).toMatchContent([
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;']
            ], '{{ item.unknown || "&nbsp;" }}');

            expect(differentRowsObjects).toMatchContent([
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;'],
                ['&nbsp;', '&nbsp;']
            ], '{{ item.unknown || "&nbsp;" }}');
        });
    });

    describe('depth-chart custom classes', function() {
        var element, compile, scope;
        beforeEach(function() {
            this.addMatchers({
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
        }));


        it('can set custom classes', function() {
            scope.providedData = [{header: 'stuff', data: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]}];
            scope.classes = ['{{ item.name }}'];
            var table = angular.element(
                '<div><depth-chart data="providedData" additional-classes="classes"></depth-chart></div>'
            );
            compile(table)(scope);
            scope.$apply();

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
    });


    describe('depth-chart scope updating', function() {
        var compile, scope;
        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope;
            compile = $compile;
        }));

        it('can update with new information', function() {
            var table = angular.element('<div><depth-chart data="providedData"></depth-chart></div>');
            compile(table)(scope);

            scope.providedData = [
                {header: 'stuff', data: ['foo', 'bar', 'baz']},
                {header: 'stuff2', data: ['foo', 'bar', 'baz']}
            ];

            scope.$apply();
            expect(table).matchesExpectedContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz']
            ]);

            scope.providedData = [
                {header: 'stuff', data: ['foo', 'bar', 'baz', 'bax']},
                {header: 'stuff2', data: ['foo', 'bar', 'baz']}
            ];
            // there's new data now
            scope.$apply();
            expect(table).matchesExpectedContent([
                ['foo', 'foo'],
                ['bar', 'bar'],
                ['baz', 'baz'],
                ['bax', '&nbsp;']
            ])
        })
    });
});
