app.directive('taxChart', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            var width = 1000;
            var height = 500;
            var margins = {
                top: 20,
                right: 50,
                bottom: 20,
                left: 50
            };

            var xScale = d3.scale.linear()
                .range([margins.left, width - margins.right]);
            var yScale = d3.scale.linear()
                .range([height - margins.top, margins.bottom]);
            var yScale2 = d3.scale.linear()
                .range([height - margins.top, margins.bottom]);

            var svg = d3.select(element[0])
                .append("svg")
                .attr("id", "directive")
                .style({
                    "width": width,
                    "height": height
                });

            var brackets = add_brackets(scope.rawBrackets.Manitoba.income, scope.rawBrackets.Federal.income);
            brackets = subtract_brackets(brackets, scope.rawBrackets.Manitoba.personalAmount);
            brackets = subtract_brackets(brackets, scope.rawBrackets.Federal.personalAmount);

            scope.data = [];

            for (var i = 0; i <= 250000; i += 100) {
                scope.data.push({
                    "Income": i,
                    "Tax": taxes_owed(i, brackets),
                    "Effective Rate": effective_rate(i, brackets),
                    "Marginal Rate": marginal_rate(i, brackets)
                });
            }

            scope.$watch('data', function(newData, oldData) {
                return scope.render(newData);
            });

            scope.render = function(data) {
                /*
                xScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Income"]; })]);
                yScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Tax"]; })]),
                yScale2
                    .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })]);

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
                    */

                d3.select('#tax')
                    .transition()
                    .duration(2000)
                    .attr('d', lineGenTax(scope.data));
                d3.select('#effective')
                    .transition()
                    .duration(2000)
                    .attr('d', lineGenEff(scope.data));
                d3.select('#marginal')
                    .transition()
                    .duration(2000)
                    .attr('d', lineGenMarg(scope.data));
            };

            xScale
                .domain([0, d3.max(scope.data, function(d) { return d["Income"]; })]);
            yScale
                .domain([0, d3.max(scope.data, function(d) { return d["Tax"]; })]);
            yScale2
                .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })]);

            var incomeAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom"),
                owedAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("right"),
                rateAxis = d3.svg.axis()
                    .scale(yScale2)
                    .orient("left");

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


            svg.append("svg:g")
                .attr("class", "x axis incomeaxis")
                .attr("transform", "translate(0," + (height - margins.bottom) + ")")
                .call(incomeAxis);
            svg.append("svg:g")
                .attr("class", "y axis owedaxis")
                .attr("transform", "translate(" + (width - margins.right) + ",0)")
                .call(owedAxis);
            svg.append("svg:g")
                .attr("class", "y axis rateaxis")
                .attr("transform", "translate(" + (margins.left) + ",0)")
                .call(rateAxis);

            svg.selectAll("line.horizontalGrid").data(yScale2.ticks(4)).enter()
                .append("line")
                .attr({
                    "class": "horizontalGrid",
                    "x1": margins.right,
                    "x2": width - margins.right,
                    "y1": function(d) { return yScale2(d); },
                    "y2": function(d) { return yScale2(d); },
                    "fill": "none",
                    "shape-rendering": "crispEdges",
                    "stroke": "grey",
                    "stroke-width": "1px"
                });

            var color = d3.scale.category10()
                .domain(["Tax", "Effective Rate", "Marginal Rate"]);




            svg.append('svg:path')
                .attr('id', 'tax')
                .attr('d', lineGenTax(scope.data))
                .attr('stroke', color("Tax"))
                .attr('stroke-width', 2)
                .attr('fill', 'none');
            svg.append('svg:path')
                .attr('id', 'effective')
                .attr('d', lineGenEff(scope.data))
                .attr('stroke', color("Effective Rate"))
                .attr('stroke-width', 2)
                .attr('fill', 'none');
            svg.append('svg:path')
                .attr('id', 'marginal')
                .attr('d', lineGenMarg(scope.data))
                .attr('stroke', color("Marginal Rate"))
                .attr('stroke-width', 2)
                .attr('fill', 'none');
        }
    }
})
