var app = angular.module("myApp", ["ngAnimate", "ui.bootstrap", "ui.bootstrap-slider"]);

app.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);
