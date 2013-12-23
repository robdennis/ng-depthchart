angular.module('example', ['ng-depthchart']);

exampleCtrl = function($scope) {
    $scope.basic_example = [
        {'header': 'column1', data:[1, 2, 3, 4, 5, 6]},
        {'header': 'column2', data:[1, 2, 3]},
        {'header': 'column3', data:[1, 2, 3, 4]},
        {'header': 'column4', data:[1, 2, 3, 4, 5]},
        {'header': 'column5', data:[1, 2, 3, 4, 5, 6]},
        {'header': 'column6', data:[1, 2, 3, 4 ]},
        {'header': 'column7', data:[1]},
        {'header': 'column8', data:[1, 2]}
    ];

    $scope.object_template_for_value = '{{item.value}}';
    $scope.object_template_for_uppercase_label = '{{item.label | uppercase}}';
    $scope.object_example = [
        {'header': 'column1', data:[
            {value: 1, label: "thing 1"},
            {value: 2, label: "thing 2"},
            {value: 3, label: "thing 3"},
            {value: 4, label: "thing 4"},
            {value: 5, label: "thing 5"},
            {value: 6, label: "thing 6"}
        ]},
        {'header': 'column2', data:[
            {value: 1, label: "thing 1"},
            {value: 2, label: "thing 2"},
            {value: 3, label: "thing 3"}
        ]},
        {'header': 'column3', data:[
            {value: 1, label: "thing 1"},
            {value: 2, label: "thing 2"},
            {value: 3, label: "thing 3"},
            {value: 4, label: "thing 4"}
        ]}
    ];
};