## ng-depthchart [![Build Status](https://travis-ci.org/robdennis/ng-depthchart.png)](https://travis-ci.org/robdennis/ng-depthchart)

An AngularJS directive for rendering a depth chart as an HTML table.

### I know what all this is already, how do I install it?
#### Bower
Assuming you have it setup for your project, the easiest way is to use [Bower](http://bower.io/)
```
bower install ng-depthchart
```

#### Download Manually
Feel free to download the latest release version directly from the github repo. 

#### After you have it
After you get it, include it in your page's HTML and your angular app's dependencies (check examples if you're not sure how to do that)

### What is a "Depth Chart"

My attempt at naming a particular type of table showing:
- multiple columns, each with related, but distinct items
- a row represents a group (that may not have significant meaning) of items that have the same rank in whatever order the column is sorted by (e.g. second row is the backup choice, or maybe the second by alphabetical order)
- as many rows as necessary to show the column with the most items

This is largely different from a "grid" that shows:
- multiple columns, each with a particular property of the item represented by the whole row
- a row represents one particular item
- as many rows as there are items.

#### Depth chart real-world examples or equivalents:
- [Pro sports](http://www.packers.com/team/depth-chart.html)
  - imagine the positions as column names)
- [Magic: The Gathering](http://www.wizards.com/Magic/Magazine/Article.aspx?x=mtg/daily/feature/203)
  - scroll down to any of the pictures that reference deckbuilding and you'll see cards organized by cost where you have different numbers at each cost

### Basic Example
#### Your angular application
For this and future examples, you can also check example.html and example.js in the source tree.

You'd want to ensure that you explicitly depend on the ng-depthchart module, and be ready to provide your data as a normalized list of objects:
```javascript 
angular.module('example', ['ng-depthchart']);

exampleCtrl = function($scope) {
    $scope.basic_example = [
        {'header': 'column1', data:[1, 2, 3, 4 ]},
        {'header': 'column2', data:[1]},
        {'header': 'column3', data:[1, 2]}
    ];
};
```
#### Your html
You'll pass your table contents to the depth-chart directive using the data attribute (usually setting it equal to a scope variable)
```html
<depth-chart data="basic_example"></depth-chart>
```

this would yield the following table:
<table>
  <thead>
    <th>column1</th>
    <th>column2</th>
    <th>column3</th>
  </thead>
  <tr>
    <td>1</td>
    <td>1</td>
    <td>1</td>
  </tr>
    <tr>
    <td>2</td>
    <td>&nbsp;</td>
    <td>2</td>
  </tr>
    <tr>
    <td>3</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  </tr>
    <tr>
    <td>4</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
</table>

This is fine, but it's not that interesting. Maybe we can do more?

### Object Example With a Template
#### Angular Code
The default template for each cell is to display a JSONified representation of whatever the data in a particular cell. This is fine in basic cases, but probably not if you're going to pass in javascript objects. Note here that we're setting a scope value with a value equal to some arbitrary angular expression using the internal name for the item associated with a particular cell (named item).

```javascript
$scope.object_template_for_value = '{{item.value}}';
$scope.object_example = [
    {'header': 'column1', data:[
        {value: 1, label: "thing 1"},
        {value: 2, label: "thing 2"},
        {value: 3, label: "thing 3"},
        {value: 4, label: "thing 4"},
    ]},
    {'header': 'column2', data:[
        {value: 1, label: "thing 1"},
    ]},
    {'header': 'column3', data:[
        {value: 1, label: "thing 1"},
        {value: 2, label: "thing 2"},
    ]}
];
```
#### HTML
Notice here that we're setting the attribute "display-template" equal to the name of the scope variable we set earlier
```html
<depth-chart data="object_example" display-template="object_template_for_value"></depth-chart>
```
As it happens, this renders the exact same table as before:
<table>
  <thead>
    <th>column1</th>
    <th>column2</th>
    <th>column3</th>
  </thead>
  <tr>
    <td>1</td>
    <td>1</td>
    <td>1</td>
  </tr>
    <tr>
    <td>2</td>
    <td>&nbsp;</td>
    <td>2</td>
  </tr>
    <tr>
    <td>3</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  </tr>
    <tr>
    <td>4</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
</table>

### Object example with a template and a filter
If we were do set a different template value, and actually use the fact that it's an arbitrary angular expression, we could do some powerful stuff:
#### Angular
```javascript
$scope.object_template_for_uppercase_label = '{{item.label | uppercase}}';
```
#### HTML
```html
<depth-chart data="object_example" display-template="object_template_for_uppercase_label"></depth-chart>
```
<table>
  <thead>
    <th>column1</th>
    <th>column2</th>
    <th>column3</th>
  </thead>
  <tr>
    <td>THING 1</td>
    <td>THING 1</td>
    <td>THING 1</td>
  </tr>
    <tr>
    <td>THING 2</td>
    <td>&nbsp;</td>
    <td>THING 2</td>
  </tr>
    <tr>
    <td>THING 3</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  </tr>
    <tr>
    <td>THING 4</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
</table>

### Projects using ng-depthchart
- [Lambic](https://github.com/robdennis/lambic)
