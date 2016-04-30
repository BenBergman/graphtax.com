app.controller("MainController", ["$scope", function($scope) {
    $scope.title = "Foobar";
    $scope.updateChart = function() {
        var index = 0;
        var data = angular.fromJson("[" + $scope.chart_data + "]");
        var bar_width = 500 / (data.length);

        d3.selectAll('.chart').selectAll('div').remove();
        d3.select(".chart")
            .selectAll("div")
            .data(data)
            .enter().append("div")
            .style("width", function(d) { return bar_width + "px"; })
            .style("height", function(d) { return d + "%"; })
            .style("left", function(d) { return (index++) * (bar_width + 2) + "px"; });
    };
}]);
