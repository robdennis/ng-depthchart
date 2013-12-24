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
});