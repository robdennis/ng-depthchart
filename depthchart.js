angular.module('ng-depthchart', [])
    .factory('ZipService', function() {
        return {
            longest: function() {
                var args = [].slice.call(arguments);
                var longest = args.reduce(function(a,b){
                    return a.length>b.length ? a : b
                }, []);

                return longest.map(function(_,i){
                    return args.map(function(array){return array[i]})
                });
            }
        }
    })
    .directive('depthChart', function ($compile, ZipService) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                displayTemplate: '=',
                additionalClasses: '='
            },

            link: function(scope, element) {
                var tdContent,
                    classes,
                    newElement,
                    template;

                scope.$watch('data', function() {
                    var items = [];
                    scope.headerRow = [];
                    angular.forEach(scope.data, function(value) {
                        scope.headerRow.push(value.header);
                        items.push(value.data || []);
                    });

                    scope.zipped = ZipService.longest.apply(this, items);
                });

                classes = (scope.additionalClasses || []);
                classes.push('depth-chart-cell');

                if (scope.displayTemplate) {
                    tdContent = scope.displayTemplate;
                } else {
                    tdContent = '{{ item || "&nbsp;"}}';
                }

                template = '' +
                '<table class="depth-chart table table-striped table-hover card-layout">' +
                    '<thead>' +
                    '   <tr class="depth-chart-header-row">' +
                            '<th ng-repeat="title in headerRow" class="depth-chart-header-cell">' +
                                '{{ title }}' +
                            '</th>' +
                        '</tr>' +
                    '</thead> ' + '<tbody>' +
                        '<tr ng-repeat="row in zipped">' +
                            '<td ng-repeat="item in row track by $index" class="'+classes.join(' ')+'">' +
                                tdContent +
                            '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>';

                newElement = angular.element(template);
                $compile(newElement)(scope);
                element.replaceWith(newElement);
            }
        };
    }
);