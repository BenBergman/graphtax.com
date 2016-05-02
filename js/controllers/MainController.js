app.controller("MainController", ["$scope", function($scope) {
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
    $scope.rawBrackets = {
        "Federal": {
            "income": [
                [45282, 0.1500],
                [90563, 0.2050],
                [140388, 0.2600],
                [200000, 0.2900],
                [Infinity, 0.3300]
            ],
            "personalAmount": [
                [11474, 0.1500]
            ]
        },
        "Manitoba": {
            "income": [
                [31000, 0.1080],
                [67000, 0.1275],
                [Infinity, 0.1740]
            ],
            "personalAmount": [
                [9134, 0.1080]
            ]
        },
        "Ontario": {
            "income": [
                [41536, 0.0505],
                [83075, 0.0915],
                [150000, 0.1116],
                [220000, 0.1216],
                [Infinity, 0.1316]
            ],
            "personalAmount": [
                [10011, 0.0505]
            ]
        }
    };
    $scope.width = 1000;
    $scope.height = 500;
    $scope.margins = {
        top: 20,
        right: 50,
        bottom: 20,
        left: 50
    }
    $scope.changeProvince = function() {
        var brackets = add_brackets($scope.rawBrackets.Manitoba.income, $scope.rawBrackets.Federal.income);
        brackets = subtract_brackets(brackets, $scope.rawBrackets.Manitoba.personalAmount);
        brackets = subtract_brackets(brackets, $scope.rawBrackets.Federal.personalAmount);


        var data = [];

        for (var i = 0; i <= 250000; i += 100) {
            data.push({
                "Income": i,
                "Tax": taxes_owed(i, brackets),
                "Effective Rate": effective_rate(i, brackets),
                "Marginal Rate": marginal_rate(i, brackets)
            });
        }




        var xScale = d3.scale.linear()
                .range([$scope.margins.left, $scope.width - $scope.margins.right])
                .domain([0, d3.max(data, function(d) { return d["Income"]; })]),
            yScale = d3.scale.linear()
                .range([$scope.height - $scope.margins.top, $scope.margins.bottom])
                .domain([0, d3.max(data, function(d) { return d["Tax"]; })]),
            yScale2 = d3.scale.linear()
                .range([$scope.height - $scope.margins.top, $scope.margins.bottom])
                .domain([0, d3.max(data, function(d) { return d["Marginal Rate"]; })]);



        var lineGenTax = d3.svg.line()
            .x(function(d) { return xScale(d.Income); })
            .y(function(d) { return yScale(d["Tax"]); })
            .interpolate("basis");
        var lineGenEff = d3.svg.line()
            .x(function(d) { return xScale(d.Income); })
            .y(function(d) { return yScale2(d["Effective Rate"]); })
            .interpolate("basis");
        var lineGenMarg = d3.svg.line()
            .x(function(d) { return xScale(d.Income); })
            .y(function(d) { return yScale2(d["Marginal Rate"]); })
            .interpolate("basis");


        d3.select('#tax')
            .transition()
            .duration(2000)
            .attr('d', lineGenTax(data));
        d3.select('#effective')
            .transition()
            .duration(2000)
            .attr('d', lineGenEff(data));
        d3.select('#marginal')
            .transition()
            .duration(2000)
            .attr('d', lineGenMarg(data));
    };
}]);
