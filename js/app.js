var app = angular.module("myApp", ["ui.bootstrap", "ui.bootstrap-slider"]);

app.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);
