app.directive('taxChart', ['$window', function($window) {
    return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
            var width = element[0].clientWidth;
            var height = width/2;
            var margins = {
                top: 20,
                right: 120,
                bottom: 70,
                left: 100
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
                .range([height - margins.bottom, margins.top]);
            var rateScale = d3.scale.linear()
                .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })])
                .range([height - margins.bottom, margins.top]);

            var incomeAxis = d3.svg.axis()
                    .scale(incomeScale)
                    .tickFormat(d3.format("$s"))
                    .orient("bottom"),
                owedAxis = d3.svg.axis()
                    .scale(owedScale)
                    .tickFormat(d3.format("$s"))
                    .orient("right"),
                rateAxis = d3.svg.axis()
                    .scale(rateScale)
                    .tickFormat(d3.format("%"))
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
                    "x1": margins.left,
                    "x2": width - margins.right,
                    "y1": function(d) { return rateScale(d); },
                    "y2": function(d) { return rateScale(d); },
                    "fill": "none",
                    "shape-rendering": "crispEdges",
                    "stroke": "lightgrey",
                    "stroke-width": "1px"
                });

            svg.append("svg:g")
                .attr("id", "incomeaxis")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (height - margins.bottom) + ")")
                .call(incomeAxis);
            svg.append("svg:g")
                .attr("id", "owedaxis")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (width - margins.right) + ",0)")
                .call(owedAxis);
            svg.append("svg:g")
                .attr("id", "rateaxis")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (margins.left) + ",0)")
                .call(rateAxis);

            svg.append("text")
                .attr("id", "incomelabel")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width/2) + "," + (height - (margins.bottom/3)) + ")")
                .text("Total Income");
            svg.append("text")
                .attr("id", "owedlabel")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width - (margins.left/2)) + "," + (height/2) + ")rotate(-90)")
                .text("Total Taxes Due");
            svg.append("text")
                .attr("id", "ratelabel")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (margins.left/2) + "," + (height/2) + ")rotate(-90)")
                .text("Rate");

            var color = d3.scale.category10()
                .domain(["Tax", "Effective Rate", "Marginal Rate"]);



            var mouseOnGraph = false;

            svg.on("mousemove", function() {
                var [x, y] = d3.mouse(this);
                if (x > margins.left &&
                    x < width - margins.right &&
                    y > margins.top &&
                    y < height - margins.bottom) {
                    if (!mouseOnGraph) {
                        svg.append("line")
                            .attr({
                                "id": "selectionline",
                                "class": "selectionline",
                                "fill": "none",
                                "shape-rendering": "crispEdges",
                                "stroke": "grey",
                                "stroke-width": "2px"
                            });
                        svg.append("circle")
                            .attr("id", "taxPoint")
                            .attr("r", 4.5);
                        svg.append("circle")
                            .attr("id", "effectivePoint")
                            .attr("r", 4.5);
                        svg.append("circle")
                            .attr("id", "marginalPoint")
                            .attr("r", 4.5);
                    }
                    mouseOnGraph = true;

                    scope.currentIncome = incomeScale.invert(x);
                    var dataPoint = scope.data[Math.round(scope.currentIncome/100)];
                    scope.currentTax = dataPoint["Tax"];
                    scope.currentEff = dataPoint["Effective Rate"];
                    scope.currentMarg = dataPoint["Marginal Rate"];

                    var y0 = d3.min([owedScale(scope.currentTax), rateScale(scope.currentEff), rateScale(scope.currentMarg)]);
                    d3.select("#selectionline")
                        .attr({
                            "x1": x,
                            "x2": x,
                            "y1": y0,
                            "y2": height - margins.bottom,
                        });

                    d3.select("#taxPoint")
                        .attr("fill", "white")
                        .attr("stroke", color("Tax"))
                        .attr("cx", x)
                        .attr("cy", owedScale(scope.currentTax));
                    d3.select("#effectivePoint")
                        .attr("fill", "white")
                        .attr("stroke", color("Effective Rate"))
                        .attr("cx", x)
                        .attr("cy", rateScale(scope.currentEff));
                    d3.select("#marginalPoint")
                        .attr("fill", "white")
                        .attr("stroke", color("Marginal Rate"))
                        .attr("cx", x)
                        .attr("cy", rateScale(scope.currentMarg));
                } else {
                    mouseOnGraph = false;
                    d3.select("#selectionline").remove();
                    d3.select("#taxPoint").remove();
                    d3.select("#effectivePoint").remove();
                    d3.select("#marginalPoint").remove();
                }
                scope.$apply();
            });


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
                .attr('fill', 'none')
                .on("mouseover", function() {
                    console.log("foobar");
                });

            scope.$watch('data', function(newData, oldData) {
                return scope.render(newData);
            });


            scope.resize = function() {
                width = element[0].clientWidth;
                height = width/2;

                svg.style({
                    "width": width,
                    "height": height,
                });

                incomeScale
                    .range([margins.left, width - margins.right]);
                owedScale
                    .range([height - margins.bottom, margins.top]);
                rateScale
                    .range([height - margins.bottom, margins.top]);

                d3.select('#incomeaxis')
                    .attr("transform", "translate(0," + (height - margins.bottom) + ")")
                    .call(incomeAxis);
                d3.select('#owedaxis')
                    .attr("transform", "translate(" + (width - margins.right) + ",0)")
                    .call(owedAxis);
                d3.select('#rateaxis')
                    .attr("transform", "translate(" + (margins.left) + ",0)")
                    .call(rateAxis);

                d3.select('#incomelabel')
                    .attr("transform", "translate(" + (width/2) + "," + (height - (margins.bottom/3)) + ")");
                d3.select('#owedlabel')
                    .attr("transform", "translate(" + (width - (margins.left/2)) + "," + (height/2) + ")rotate(-90)");
                d3.select('#ratelabel')
                    .attr("transform", "translate(" + (margins.left/2) + "," + (height/2) + ")rotate(-90)");

                d3.select('#tax')
                    .attr('d', lineGenTax(scope.data));
                d3.select('#effective')
                    .attr('d', lineGenEff(scope.data));
                d3.select('#marginal')
                    .attr('d', lineGenMarg(scope.data));
            };


            angular.element($window).on('resize', function() {
                scope.resize();
            });


            scope.render = function(data) {
                var tempTax = lineGenTax(scope.data);
                var tempEff = lineGenEff(scope.data);
                var tempMarg = lineGenMarg(scope.data);

                incomeScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Income"]; })]);
                owedScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Tax"]; })]);
                rateScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })]);

                var transition_time_one = 2000;
                var transition_time_two = 2000;

                svg.selectAll("line.horizontalGrid").data(rateScale.ticks(4))
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr({
                        "y1": function(d) { return rateScale(d); },
                        "y2": function(d) { return rateScale(d); }
                    });

                d3.select('#incomeaxis')
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .call(incomeAxis);

                d3.select('#owedaxis')
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .call(owedAxis);

                d3.select('#rateaxis')
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .call(rateAxis);

                d3.select('#tax')
                    .transition()
                    .duration(transition_time_one)
                    .attr('d', tempTax);
                d3.select('#tax')
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr('d', lineGenTax(scope.data));

                d3.select('#effective')
                    .transition()
                    .duration(transition_time_one)
                    .attr('d', tempEff);
                d3.select('#effective')
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr('d', lineGenEff(scope.data));

                d3.select('#marginal')
                    .transition()
                    .duration(transition_time_one)
                    .attr('d', tempMarg);
                d3.select('#marginal')
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr('d', lineGenMarg(scope.data));
            };
        }
    };
}]);
