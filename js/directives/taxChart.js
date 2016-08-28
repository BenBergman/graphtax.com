app.directive('taxChart', ['$window', function($window) {
    return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
            scope.calculateData = function() {
                var federal_bracket = scope.rawBrackets.Federal.income;
                var regional_bracket = scope.rawBrackets[scope.currentRegion].income;

                var brackets = add_brackets(federal_bracket, regional_bracket);


                scope.data = [];

                scope.taxes = [
                    {
                        "name": "Federal",
                        "values": []
                    },
                    {
                        "name": "Provincial",
                        "values": []
                    }
                ];

                scope.effective = [
                    {
                        "name": "Federal",
                        "values": []
                    },
                    {
                        "name": "Provincial",
                        "values": []
                    }
                ];

                scope.marginal = [
                    {
                        "name": "Federal",
                        "values": []
                    },
                    {
                        "name": "Provincial",
                        "values": []
                    }
                ];


                for (var i = 0; i <= 250000; i += 100) {
                    var federal_tax = taxes_owed(i - (scope.accordions.credits ? scope.sliders.deduction : 0) - scope.rawBrackets.Federal.standardDeduction - scope.rawBrackets.Federal.personalExemption, federal_bracket);
                    var regional_tax = taxes_owed(i - (scope.accordions.credits ? scope.sliders.deduction : 0), regional_bracket);
                    var refundable_credits = (scope.accordions.credits ? scope.sliders.creditRefundable : 0);

                    var tax_owed = federal_tax + regional_tax - refundable_credits;
                    if (tax_owed > 0) {
                        tax_owed -= scope.accordions.credits ? scope.sliders.creditNonRefundable : 0;
                        if (tax_owed < 0) {
                            tax_owed = 0;
                        }
                    }
                    var eff_rate = 0;
                    if (i > 0) {
                        eff_rate = tax_owed / i;
                    }
                    var fed_marg_rate = marginal_rate(i - (scope.accordions.credits ? scope.sliders.deduction : 0) - scope.rawBrackets.Federal.standardDeduction - scope.rawBrackets.Federal.personalExemption, federal_bracket);
                    var reg_marg_rate = marginal_rate(i - (scope.accordions.credits ? scope.sliders.deduction : 0), regional_bracket);
                    var marg_rate = fed_marg_rate + reg_marg_rate;
                    if (tax_owed == 0) {
                        marg_rate = 0;
                    }
                    scope.data.push({
                        "Income": i,
                        "Tax": tax_owed,
                        "Effective Rate": eff_rate,
                        "Marginal Rate": marg_rate
                    });

                    d3.map(scope.taxes, function(d) { return d.name; }).get("Federal").values.push({
                        "income": i,
                        "tax": federal_tax,
                    });
                    d3.map(scope.taxes, function(d) { return d.name; }).get("Provincial").values.push({
                        "income": i,
                        "tax": regional_tax,
                    });

                    d3.map(scope.effective, function(d) { return d.name; }).get("Federal").values.push({
                        "income": i,
                        "effective": effective_rate(i, federal_bracket, federal_tax),
                    });
                    d3.map(scope.effective, function(d) { return d.name; }).get("Provincial").values.push({
                        "income": i,
                        "effective": effective_rate(i, regional_bracket, regional_tax),
                    });

                    d3.map(scope.marginal, function(d) { return d.name; }).get("Federal").values.push({
                        "income": i,
                        "marginal": marginal_rate(i - scope.rawBrackets.Federal.standardDeduction - scope.rawBrackets.Federal.personalExemption, federal_bracket),
                    });
                    d3.map(scope.marginal, function(d) { return d.name; }).get("Provincial").values.push({
                        "income": i,
                        "marginal": marginal_rate(i, regional_bracket),
                    });
                }
            }


            var width = element[0].clientWidth;
            update_sizes();

            var areaOpacity = "0.3";

            var svg = d3.select(element[0])
                .append("svg")
                .attr("id", "tax-chart")
                .style({
                    "width": width,
                    "height": height
                });

            scope.calculateData();


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
                    .innerTickSize(margins.top + margins.bottom - height)
                    .tickPadding(10)
                    .ticks(ticks)
                    .orient("bottom"),
                owedAxis = d3.svg.axis()
                    .scale(owedScale)
                    .tickFormat(d3.format("$s"))
                    .orient(owedAxisOrientation),
                rateAxis = d3.svg.axis()
                    .scale(rateScale)
                    .tickFormat(d3.format("%"))
                    .innerTickSize(rateAxisInnerTickSize)
                    .tickPadding(rateAxisTickPadding)
                    .orient(rateAxisOrientation);

            var taxStack = d3.layout.stack()
                .offset("zero")
                .values(function(d) { return d.values; })
                .x(function(d) { return d.income; })
                .y(function(d) { return d.tax; })

            var effectiveStack = d3.layout.stack()
                .offset("zero")
                .values(function(d) { return d.values; })
                .x(function(d) { return d.income; })
                .y(function(d) { return d.effective; })

            var marginalStack = d3.layout.stack()
                .offset("zero")
                .values(function(d) { return d.values; })
                .x(function(d) { return d.income; })
                .y(function(d) { return d.marginal; })

            var area = d3.svg.area()
                .interpolate("cardinal")
                .x(function(d) { return incomeScale(d.income); })
                .y0(function(d) { return owedScale(d.y0); })
                .y1(function(d) { return owedScale(d.y0 + d.tax); });

            var effectiveArea = d3.svg.area()
                .interpolate("cardinal")
                .x(function(d) { return incomeScale(d.income); })
                .y0(function(d) { return rateScale(d.y0); })
                .y1(function(d) { return rateScale(d.y0 + d.effective); });

            var marginalArea = d3.svg.area()
                .interpolate("cardinal")
                .x(function(d) { return incomeScale(d.income); })
                .y0(function(d) { return rateScale(d.y0); })
                .y1(function(d) { return rateScale(d.y0 + d.marginal); });

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

            var color = d3.scale.category10()
                .domain(["Tax", "Effective Rate", "Marginal Rate"]);


            add_axis();
            draw_areas();
            draw_data();

            var mouseOnGraph = false;
            svg.on("mousemove", update_cursor_line);

            angular.element($window).on('resize', resize);


            function add_axis() {
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
                    .text("Pre-tax Income");
                svg.append("text")
                    .attr("id", "owedlabel")
                    .attr("class", "label ylabel")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate(" + (width - (margins.left/2)) + "," + (height/2) + ")rotate(-90)")
                    .text("Total Taxes Due");
                svg.append("text")
                    .attr("id", "ratelabel")
                    .attr("class", "label ylabel")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate(" + (margins.left/2) + "," + (height/2) + ")rotate(-90)")
                    .text("Rate");

                d3.selectAll('.ylabel')
                    .style("fill-opacity", labelOpacity);
            }


            function update_cursor_line() {
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
                            .attr("id", "marginalPoint")
                            .attr("r", 4.5);
                        svg.append("circle")
                            .attr("id", "effectivePoint")
                            .attr("r", 4.5);
                        svg.append("circle")
                            .attr("id", "taxPoint")
                            .attr("r", 4.5);
                    }
                    mouseOnGraph = true;

                    scope.currentIncome = incomeScale.invert(x);
                    var dataIndex = Math.round(scope.currentIncome/100);
                    var dataPoint = scope.data[dataIndex];
                    scope.currentTax = dataPoint["Tax"];
                    scope.currentEff = dataPoint["Effective Rate"];
                    scope.currentMarg = dataPoint["Marginal Rate"];

                    scope.currentFederalTax = d3.map(scope.taxes, function(d) { return d.name; })
                        .get("Federal")
                        .values[dataIndex]
                        .tax;
                    scope.currentRegionalTax = d3.map(scope.taxes, function(d) { return d.name; })
                        .get("Provincial")
                        .values[dataIndex]
                        .tax;

                    scope.currentFederalEff = d3.map(scope.effective, function(d) { return d.name; })
                        .get("Federal")
                        .values[dataIndex]
                        .effective;
                    scope.currentRegionalEff = d3.map(scope.effective, function(d) { return d.name; })
                        .get("Provincial")
                        .values[dataIndex]
                        .effective;

                    scope.currentFederalMarg = d3.map(scope.marginal, function(d) { return d.name; })
                        .get("Federal")
                        .values[dataIndex]
                        .marginal;
                    scope.currentRegionalMarg = d3.map(scope.marginal, function(d) { return d.name; })
                        .get("Provincial")
                        .values[dataIndex]
                        .marginal;

                    var y1 = d3.min([owedScale(scope.currentTax), rateScale(scope.currentEff), rateScale(scope.currentMarg)]);
                    var y2 = d3.max([owedScale(scope.currentTax), rateScale(scope.currentEff), rateScale(scope.currentMarg)]);
                    d3.select("#selectionline")
                        .attr({
                            "x1": x,
                            "x2": x,
                            "y1": y1,
                            "y2": Math.max(y2, height - margins.bottom),
                        });

                    var owedPos = owedScale(scope.currentTax);
                    var effPos = rateScale(scope.currentEff);
                    var margPos = rateScale(scope.currentMarg);

                    d3.select("#taxPoint")
                        .attr("fill", "white")
                        .attr("stroke", color("Tax"))
                        .attr("cx", x)
                        .attr("cy", owedPos);
                    d3.select("#effectivePoint")
                        .attr("fill", "white")
                        .attr("stroke", color("Effective Rate"))
                        .attr("cx", x)
                        .attr("cy", effPos);
                    d3.select("#marginalPoint")
                        .attr("fill", "white")
                        .attr("stroke", color("Marginal Rate"))
                        .attr("cx", x)
                        .attr("cy", margPos);

                    var owedDistance = Math.abs(y - owedPos);
                    var effDistance = Math.abs(y - effPos);
                    var margDistance = Math.abs(y - margPos);
                    var minDistance = Math.min(owedDistance, effDistance, margDistance);

                    if (scope.accordions.breakdown) {
                        svg.selectAll(".line")
                            .transition()
                            .duration(100)
                            .attr('stroke-width', 2);

                        svg.selectAll(".layer")
                            .transition()
                            .duration(100)
                            .style("fill-opacity", "0.1");

                        if (owedDistance == minDistance) {
                            svg.selectAll(".taxLayer")
                                .transition()
                                .duration(100)
                                .style("fill-opacity", "0.7");

                            svg.select("#tax")
                                .transition()
                                .duration(100)
                                .attr('stroke-width', 5);
                        } else if (effDistance == minDistance) {
                            svg.selectAll(".effectiveLayer")
                                .transition()
                                .duration(100)
                                .style("fill-opacity", "0.7");

                            svg.select("#effective")
                                .transition()
                                .duration(100)
                                .attr('stroke-width', 5);
                        } else if (margDistance == minDistance) {
                            svg.selectAll(".marginalLayer")
                                .transition()
                                .duration(100)
                                .style("fill-opacity", "0.7");

                            svg.select("#marginal")
                                .transition()
                                .duration(100)
                                .attr('stroke-width', 5);
                        }
                    }
                } else {
                    mouseOnGraph = false;
                    d3.select("#selectionline").remove();
                    d3.select("#taxPoint").remove();
                    d3.select("#effectivePoint").remove();
                    d3.select("#marginalPoint").remove();
                    if (scope.accordions.breakdown) {
                        svg.selectAll(".layer")
                            .transition()
                            .duration(100)
                            .style("fill-opacity", "0.3");

                        svg.selectAll(".line")
                            .transition()
                            .duration(100)
                            .attr('stroke-width', 2);
                    }
                }
                scope.$apply();
            };


            function draw_areas() {
                var z = d3.scale.category20c().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

                var marginalLayers = marginalStack(scope.marginal);
                svg.selectAll(".marginalLayer")
                    .data(marginalLayers)
                    .enter().append("path")
                    .attr("class", "layer marginalLayer")
                    .attr("d", function(d) { return marginalArea(d.values); })
                    .style("fill", function(d, i) { return z(i + 8); })
                    .style("fill-opacity", "0.3");

                var effectiveLayers = effectiveStack(scope.effective);
                svg.selectAll(".effectiveLayer")
                    .data(effectiveLayers)
                    .enter().append("path")
                    .attr("class", "layer effectiveLayer")
                    .attr("d", function(d) { return effectiveArea(d.values); })
                    .style("fill", function(d, i) { return z(i + 4); })
                    .style("fill-opacity", "0.3");

                var layers = taxStack(scope.taxes);
                svg.selectAll(".taxLayer")
                    .data(layers)
                    .enter().append("path")
                    .attr("class", "layer taxLayer")
                    .attr("d", function(d) { return area(d.values); })
                    .style("fill", function(d, i) { return z(i); })
                    .style("fill-opacity", "0.3");
            }


            function draw_data() {
                svg.append('svg:path')
                    .attr('id', 'marginal')
                    .attr('class', 'line')
                    .attr('d', lineGenMarg(scope.data))
                    .attr('stroke', color("Marginal Rate"))
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
                svg.append('svg:path')
                    .attr('id', 'effective')
                    .attr('class', 'line')
                    .attr('d', lineGenEff(scope.data))
                    .attr('stroke', color("Effective Rate"))
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
                svg.append('svg:path')
                    .attr('id', 'tax')
                    .attr('class', 'line')
                    .attr('d', lineGenTax(scope.data))
                    .attr('stroke', color("Tax"))
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            }


            function update_sizes() {
                var breakPoint = 750;

                height = width * (width < breakPoint ? 0.7 : 0.5);

                margins = {
                    top: width < breakPoint ? 20 : 25,
                    left: width < breakPoint ? 0 : 100,
                    right: width < breakPoint ? 0 : 120,
                    bottom: 70,
                };

                labelOpacity = width < breakPoint ? 0.0 : 1.0;
                ticks = width < breakPoint ? 8 : 12;

                owedAxisOrientation = width < breakPoint ? "left" : "right";
                rateAxisOrientation = width < breakPoint ? "right" : "left";
                rateAxisTickPadding = width < breakPoint ? 10 - width : 10;
                rateAxisInnerTickSize = (margins.right + margins.left - width) * (width < breakPoint ? -1 : 1);
            }


            function resize() {
                width = element[0].clientWidth;
                update_sizes();

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

                d3.selectAll('.ylabel')
                    .style("fill-opacity", labelOpacity);

                incomeAxis
                    .innerTickSize(margins.top + margins.bottom - height)
                    .ticks(ticks);
                owedAxis
                    .orient(owedAxisOrientation);
                rateAxis
                    .orient(rateAxisOrientation)
                    .tickPadding(rateAxisTickPadding)
                    .innerTickSize(rateAxisInnerTickSize);

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

                svg.selectAll(".taxLayer")
                    .attr("d", function(d) { return area(d.values); });
                svg.selectAll(".effectiveLayer")
                    .attr("d", function(d) { return effectiveArea(d.values); });
                svg.selectAll(".marginalLayer")
                    .attr("d", function(d) { return marginalArea(d.values); });
            };


            scope.render = function() {
                var transition_time_one = 2000;
                var transition_time_two = 2000;

                if (!scope.doneFirstRender) {
                    transition_time_one = 0;
                    if (scope.currentRegion != "State"){
                        scope.doneFirstRender = true;
                    }
                }

                var tempTax = lineGenTax(scope.data);
                var tempEff = lineGenEff(scope.data);
                var tempMarg = lineGenMarg(scope.data);

                svg.selectAll(".taxLayer")
                    .data(taxStack(scope.taxes))
                    .transition()
                    .duration(transition_time_one)
                    .attr("d", function(d) { return area(d.values); });

                svg.selectAll(".effectiveLayer")
                    .data(effectiveStack(scope.effective))
                    .transition()
                    .duration(transition_time_one)
                    .attr("d", function(d) { return effectiveArea(d.values); });

                svg.selectAll(".marginalLayer")
                    .data(marginalStack(scope.marginal))
                    .transition()
                    .duration(transition_time_one)
                    .attr("d", function(d) { return marginalArea(d.values); });

                if (!scope.accordions.breakdown) {
                    svg.selectAll(".layer")
                        .style("fill-opacity", "0.0");
                }


                incomeScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Income"]; })]);
                owedScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Tax"]; })]);
                rateScale
                    .domain([0, d3.max(scope.data, function(d) { return d["Marginal Rate"]; })]);


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
                    .attr('d', tempTax)
                    .transition()
                    .duration(transition_time_two)
                    .attr('d', lineGenTax(scope.data));

                d3.select('#effective')
                    .transition()
                    .duration(transition_time_one)
                    .attr('d', tempEff)
                    .transition()
                    .duration(transition_time_two)
                    .attr('d', lineGenEff(scope.data));

                d3.select('#marginal')
                    .transition()
                    .duration(transition_time_one)
                    .attr('d', tempMarg)
                    .transition()
                    .duration(transition_time_two)
                    .attr('d', lineGenMarg(scope.data));


                svg.selectAll(".taxLayer")
                    .data(taxStack(scope.taxes))
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr("d", function(d) { return area(d.values); });

                svg.selectAll(".effectiveLayer")
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr("d", function(d) { return effectiveArea(d.values); });

                svg.selectAll(".marginalLayer")
                    .data(marginalStack(scope.marginal))
                    .transition()
                    .delay(transition_time_one)
                    .duration(transition_time_two)
                    .attr("d", function(d) { return marginalArea(d.values); });
            };

            scope.renderCredits = function(duration) {
                var tempTax = lineGenTax(scope.data);
                var tempEff = lineGenEff(scope.data);
                var tempMarg = lineGenMarg(scope.data);

                d3.select('#tax')
                    .attr('d', tempTax);

                d3.select('#effective')
                    .attr('d', tempEff);

                d3.select('#marginal')
                    .attr('d', tempMarg);
            };

            scope.renderCreditsSlow = function() {
                var tempTax = lineGenTax(scope.data);
                var tempEff = lineGenEff(scope.data);
                var tempMarg = lineGenMarg(scope.data);

                d3.select('#tax')
                    .transition()
                    .duration(200)
                    .attr('d', tempTax);

                d3.select('#effective')
                    .transition()
                    .duration(200)
                    .attr('d', tempEff);

                d3.select('#marginal')
                    .transition()
                    .duration(200)
                    .attr('d', tempMarg);
            };

            scope.toggleAreas = function(show) {
                if (show) {
                    svg.selectAll(".marginalLayer")
                        .transition()
                        .delay(400)
                        .duration(200)
                        .style("fill-opacity", areaOpacity);
                    svg.selectAll(".effectiveLayer")
                        .transition()
                        .delay(200)
                        .duration(200)
                        .style("fill-opacity", areaOpacity);
                    svg.selectAll(".taxLayer")
                        .transition()
                        .duration(200)
                        .style("fill-opacity", areaOpacity);
                } else {
                    svg.selectAll(".layer")
                        .transition()
                        .duration(200)
                        .style("fill-opacity", "0.0");
                }
            };
        }
    };
}]);
