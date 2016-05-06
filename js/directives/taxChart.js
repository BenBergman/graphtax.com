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

            var svg = d3.select(element[0])
                .append("svg")
                .attr("id", "directive")
                .style({
                    "width": width,
                    "height": height
                });

            var brackets = add_brackets(scope.rawBrackets[scope.currentProvince].income, scope.rawBrackets.Federal.income);
            brackets = subtract_brackets(brackets, scope.rawBrackets[scope.currentProvince].personalAmount);
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

            var incomeScale = d3.scale.linear()
                .domain([0, d3.max(scope.data, function(d) { return d["Income"]; })])
                .range([margins.left, width - margins.right]);
            var owedScale = d3.scale.linear()
                .domain([0, d3.max(scope.data, function(d) { return d["Tax"]; })])
                .range([height - margins.top, margins.bottom]);
            var rateScale = d3.scale.linear()
                .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })])
                .range([height - margins.top, margins.bottom]);

            var incomeAxis = d3.svg.axis()
                    .scale(incomeScale)
                    .orient("bottom"),
                owedAxis = d3.svg.axis()
                    .scale(owedScale)
                    .orient("right"),
                rateAxis = d3.svg.axis()
                    .scale(rateScale)
                    .orient("left");

            var lineGenTax = d3.svg.line()
                .x(function(d) { return incomeScale(d.Income); })
                .y(function(d) { return owedScale(d["Tax"]); })
                .interpolate("basis");
            var lineGenEff = d3.svg.line()
                .x(function(d) { return incomeScale(d.Income); })
                .y(function(d) { return rateScale(d["Effective Rate"]); })
                .interpolate("basis");
            var lineGenMarg = d3.svg.line()
                .x(function(d) { return incomeScale(d.Income); })
                .y(function(d) { return rateScale(d["Marginal Rate"]); })
                .interpolate("basis");


            svg.selectAll("line.horizontalGrid").data(rateScale.ticks(4)).enter()
                .append("line")
                .attr({
                    "class": "horizontalGrid",
                    "x1": margins.right,
                    "x2": width - margins.right,
                    "y1": function(d) { return rateScale(d); },
                    "y2": function(d) { return rateScale(d); },
                    "fill": "none",
                    "shape-rendering": "crispEdges",
                    "stroke": "lightgrey",
                    "stroke-width": "1px"
                });

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

            scope.$watch('data', function(newData, oldData) {
                return scope.render(newData);
            });

            scope.render = function(data) {
                incomeScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Income"]; })]);
                owedScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Tax"]; })]),
                rateScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })]);

                svg.selectAll("line.horizontalGrid").data(rateScale.ticks(4))
                    .transition()
                    .duration(2000)
                    .attr({
                        "y1": function(d) { return rateScale(d); },
                        "y2": function(d) { return rateScale(d); }
                    });

                d3.select('.incomeaxis')
                    .transition()
                    .duration(2000)
                    .call(incomeAxis);

                d3.select('.owedaxis')
                    .transition()
                    .duration(2000)
                    .call(owedAxis);

                d3.select('.rateaxis')
                    .transition()
                    .duration(2000)
                    .call(rateAxis);

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
        }
    }
})
