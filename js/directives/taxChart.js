app.directive('taxChart', function() {
    return {
        restrict: 'E',
        scope: {},
        link: function(scope, element, attrs) {
            var svg = d3.select(element[0])
                .append("svg")
                .attr("id", "directive")
                .style({
                    "width": "100%",
                    "height": 500
                });

            var fed_brackets = [
                [45282, 0.1500],
                [90563, 0.2050],
                [140388, 0.2600],
                [200000, 0.2900],
                [Infinity, 0.3300]
            ];

            var mb_brackets = [
                [31000, 0.1080],
                [67000, 0.1275],
                [Infinity, 0.1740]
            ];

            var on_brackets = [
                [41536, 0.0505],
                [83075, 0.0915],
                [150000, 0.1116],
                [220000, 0.1216],
                [Infinity, 0.1316]
            ];

            var fed_personal_amt = [
                [11474, 0.1500]
            ];

            var mb_personal_amt = [
                [9134, 0.1080]
            ];

            var on_personal_amt = [
                [10011, 0.0505]
            ];

            var brackets= add_brackets(mb_brackets, fed_brackets);
            brackets = subtract_brackets(brackets, mb_personal_amt);
            brackets = subtract_brackets(brackets, fed_personal_amt);

            var data = [];

            for (var i = 0; i <= 250000; i += 100) {
                data.push({
                    "Income": i,
                    "Tax": taxes_owed(i, brackets),
                    "Effective Rate": effective_rate(i, brackets),
                    "Marginal Rate": marginal_rate(i, brackets)
                });
            }

            var WIDTH = 1000,
                HEIGHT = 500,
                    MARGINS = {
                        top: 20,
                        right: 50,
                        bottom: 20,
                        left: 50
                    },

                xScale = d3.scale.linear()
                    .range([MARGINS.left, WIDTH - MARGINS.right])
                    .domain([0, d3.max(data, function(d) { return d["Income"]; })]),
                yScale = d3.scale.linear()
                    .range([HEIGHT - MARGINS.top, MARGINS.bottom])
                    .domain([0, d3.max(data, function(d) { return d["Tax"]; })]),
                yScale2 = d3.scale.linear()
                    .range([HEIGHT - MARGINS.top, MARGINS.bottom])
                    .domain([0, d3.max(data, function(d) { return d["Marginal Rate"]; })]),

                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom"),
                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("right"),
                yAxis2 = d3.svg.axis()
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
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
                .call(xAxis);
            svg.append("svg:g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (WIDTH - MARGINS.right) + ",0)")
                .call(yAxis);
            svg.append("svg:g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (MARGINS.left) + ",0)")
                .call(yAxis2);

            svg.selectAll("line.horizontalGrid").data(yScale2.ticks(4)).enter()
                .append("line")
                .attr({
                    "class": "horizontalGrid",
                    "x1": MARGINS.right,
                    "x2": WIDTH - MARGINS.right,
                    "y1": function(d) { return yScale2(d); },
                    "y2": function(d) { return yScale2(d); },
                    "fill": "none",
                    "shape-rendering": "crispEdges",
                    "stroke": "grey",
                    "stroke-width": "1px"
                });

            var color = d3.scale.category10()
                .domain(["Tax", "Effective Rate", "Marginal Rate"]);




            var brackets = add_brackets(on_brackets, fed_brackets);
            brackets = subtract_brackets(brackets, on_personal_amt);
            brackets = subtract_brackets(brackets, fed_personal_amt);

            var data2 = [];

            for (var i = 0; i <= 250000; i += 100) {
                data2.push({
                    "Income": i,
                    "Tax": taxes_owed(i, brackets),
                    "Effective Rate": effective_rate(i, brackets),
                    "Marginal Rate": marginal_rate(i, brackets)
                });
            }





            svg.append('svg:path')
                .attr('id', 'tax')
                .attr('d', lineGenTax(data))
                .attr('stroke', color("Tax"))
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .transition()
                .delay(2000)
                .duration(2000)
                .attr('d', lineGenTax(data2));
            svg.append('svg:path')
                .attr('id', 'effective')
                .attr('d', lineGenEff(data))
                .attr('stroke', color("Effective Rate"))
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .transition()
                .delay(2000)
                .duration(2000)
                .attr('d', lineGenEff(data2));
            svg.append('svg:path')
                .attr('id', 'marginal')
                .attr('d', lineGenMarg(data))
                .attr('stroke', color("Marginal Rate"))
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .transition()
                .delay(2000)
                .duration(2000)
                .attr('d', lineGenMarg(data2));
        }
    }
})
