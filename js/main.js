// InfoVis Final Project (P5)
// Author1: Stacee Freeman
// Author2: Scott Higgins
// CS 4460, Fall 2017

var svg = d3.select('svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 20, r: 20, b: 20, l: 20};
var plotPadding = 40;

var compareWidth = svgWidth/4 - padding.r;
var compareHeight = (svgHeight) / 2;

var filterWidth = (svgWidth * (2/3)) - padding.l - padding.r - plotPadding;
var filterHeight = svgHeight/2 - padding.t - padding.b - 40 - plotPadding;

var filterAttributes = ['admission_rate', 'act_median', 'sat_average', 'undergrad_pop'];
var extentByAttribute = {};
var filterTitles = {
    admission_rate: 'Admission Rate',
    act_median: 'ACT Median',
    sat_average: 'SAT Average'
}

//height & width for the filter attributes (ex: sat average, act)
var attributeHeight = 90;
var attributeWidth = filterWidth - 20;

var xScaleFilter = d3.scalePoint()
    .domain(d3.range(filterAttributes.length))
    .range([0, filterWidth - 20]);
var y = {};

var yScaleFilter = d3.scaleLinear()
    .rangeRound([filterHeight, 0])
var yAxisFilter = d3.axisLeft(yScaleFilter).tickFormat(d3.format(""));

var foreground;

var brushCell;

var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 0])
    .html(function(d) {
        return '<h5>' + d.name + '</h5>'
    });

svg.call(toolTip);

var usColleges;

var projection = d3.geoAlbersUsa()
    .scale(900)
    .translate([svgWidth/2,210]);
var path = d3.geoPath()
    .projection(projection);

d3.json("./data/us.json", function(error, us) {
    var map = svg.append('g')
        .attr('class', 'mapOfStates');

    map.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.states))
        .attr("d", path);

    updateDots()
});


// College data
d3.csv('./data/colleges.csv',
function(row){
    return {
        name: row['Name'],
        admission_rate_show: true,
        act_median_show: true,
        sat_average_show: true,
        undergrad_pop_show: true,
        latitude: +row['Latitude'],
        longitude: +row['Longitude'],
        control: row['Control'],
        region: row['Region'],
        locale: row['Locale'],
        admission_rate: +row['Admission Rate'],
        act_median: +row['ACT Median'],
        sat_average: +row['SAT Average'],
        undergrad_pop: +row['Undergrad Population'],
        percent_white: +row['% White'],
        percent_black: +row['% Black'],
        percent_hispanic: +row['% Hispanic'],
        percent_asian: +row['% Asian'],
        percent_amer_indian: +row['% American Indian'],
        percent_pacific_islander: +row['% Pacific Islander'],
        percent_biracial: +row['% Biracial'],
        percent_aliens: +row['% Nonresident Aliens'],
        percent_part_time_students: +row['% Part-time Undergrads'],
        average_cost: +row['Average Cost'],
        expenditure_per_student: +row['Expenditure Per Student'],
        average_faculty_salary: +row['Average Faculty Salary'],
        percent_full_time_faculty: +row['% Full-time Faculty'],
        percent_students_with_pell: +row['% Undergrads with Pell Grant'],
        completion_rate: +row['Completion Rate 150% time'],
        retention_rate: +row['Retention Rate (First Time Students)'],
        percent_older_students: +row['% Undergrads 25+ y.o.'],
        three_year_default_rate: +row['3 Year Default Rate'],
        median_debt: +row['Median Debt'],
        median_debt_on_graduation: +row['Median Debt on Graduation'],
        median_debt_on_withdrawal: +row['Median Debt on Withdrawal'],
        percent_federal_loans: +row['% Federal Loans'],
        percent_pell_recipients: +row['% Pell Grant Recipients'],
        average_entry_age: +row['Average Age of Entry'],
        average_family_income: +row['Average Family Income'],
        median_family_income: +row['Median Family Income'],
        poverty_rate: +row['Poverty Rate'],
        unemployed_after_eight: +row['Number of Unemployed 8 years after entry'],
        employed_after_eight: +row['Number of Employed 8 years after entry'],
        mean_earnings_after_eight: +row['Mean Earnings 8 years After Entry'],
        median_earnings_after_eight: +row['Median Earnings 8 years After Entry']
    }
},
function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/colleges.csv dataset.');
        console.error(error);
        return;
    }

    //filters out the colleges that are not in the US
    usColleges = dataset.filter(function(d) {
        return projection([d.longitude, d.latitude]) != null;
    })

    //creates a rectangle - top left
    college1 = svg.append('g')
        .attr('class', 'collegeCmp1')
        .attr('transform', 'translate(' + [padding.l, padding.t] + ')')

    college1.append('rect')
        .attr('width', compareWidth)
        .attr('height', compareHeight)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', '1.5')
        .attr('stroke-opacity', '0.1');

    //creates a rectangle - top right
    college2 = svg.append('g')
        .attr('class', 'collegeCmp2')
        .attr('transform', 'translate(' + [svgWidth - (svgWidth/4), padding.t] + ')')

    college2.append('rect')
        .attr('width', compareWidth)
        .attr('height', compareHeight)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', '1.5')
        .attr('stroke-opacity', '0.1');

    // right side rectangle
    filterCollegesGroup = svg.append('g')
        .attr('class', 'filterColleges')
        .attr('transform', 'translate(' + [padding.l + (svgWidth/6), padding.t + 400] + ')')

    filterCollegesGroup.append('rect')
        .attr('width', filterWidth + plotPadding)
        .attr('height', filterHeight + plotPadding)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', '1.5')
        .attr('stroke-opacity', '0.1');

    filterColleges = filterCollegesGroup.append('g')
        .attr('transform', 'translate(' + [plotPadding, plotPadding/2] + ')')

    filterAttributes.forEach(function(attribute) {
        extentByAttribute[attribute] = d3.extent(usColleges, function(d) {
            return d[attribute];
        })
    })

    // scale and brush for each attribute (sat, act, admision, etc)
    filterAttributes.forEach(function(attribute) {
        y[attribute] = d3.scaleLinear()
            .domain(extentByAttribute[attribute])
            .rangeRound([filterHeight, 0]);

        y[attribute].brush = d3.brushY()
            .extent([[-10,0], [10,filterHeight]])
            .on('start', brushstart)
            .on('brush', brushmove)
            .on('end', brushend)
    })

    var attributeG = filterColleges.selectAll('.attribute')
        .data(filterAttributes)
        .enter()
        .append('g')
        .attr('class', 'attribute')
        .attr('transform', function(attribute, i) {
            return 'translate(' + xScaleFilter(i) + ')';
        })

    var axes = attributeG.append('g')
        .attr('class', 'axis')
        .each(function(attribute) {
            d3.select(this).call(yAxisFilter.scale(y[attribute]));
        })

    axes.append('g')
        .attr('class', 'brush')
        .each(function(attribute) {
            d3.select(this).call(y[attribute].brush);
        });


    //
    // var filterGraph = svg.selectAll('.filterGraph')
    //     .data(filterAttributes)
    //     .enter()
    //     .append('g')
    //     .attr('class', 'filterGraph')
    //     .attr('transform', function(attribute, i) {
    //         return 'translate(' + [svgWidth - padding.r - filterWidth, padding.t + (i * (attributeHeight + plotPadding + 15))] + ')'
    //     })
    //
    // filterGraph.append('text')
    //     .attr('class', 'filterTitle')
    //     .attr('transform', 'translate(' + [10, attributeHeight + 40] + ')')
    //     .text(function(attribute) {
    //         return filterTitles[attribute];
    //     });
    //
    // filterGraph.append('g')
    //     .attr('class', 'axis axis-x')
    //     .attr('transform', 'translate(' + [10, attributeHeight+10] + ')')
    //     .each(function(attribute) {
    //         // xScaleFilter.domain(extentByAttribute[attribute])
    //         // d3.select(this).call(xAxisFilter)
    //         d3.select(this).call(axis.scale(x[attribute]))
    //     })
    //

    // console.log(x)
    // filterGraph.append('g')
    //     .attr('class', 'brush')
    //     .each(function(attribute) {
    //         d3.select(this).call(x[attribute].brush);
    //     })
        // .attr('transform', 'translate(' + [10, 0] + ')')
        // .call(brush)
});

function updateDots() {
    //checks to see if the show attribute is true and filters colleges
    var showColleges = usColleges.filter(function(d) {
        return d.admission_rate_show && d.act_median_show && d.sat_average_show && d.undergrad_pop_show;
    })

    var dots = svg.selectAll('.dot')
        .data(showColleges, function(d) {
            return d.name;
        });

    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')

    dotsEnter.merge(dots)
        .attr('transform', function(d) {
            cx = projection([d.longitude, d.latitude])[0]
            cy = projection([d.longitude, d.latitude])[1]
            return 'translate(' + [cx, cy] + ')'
        });

    dotsEnter.append('circle')
        .attr('r', 2.5)
        .attr('fill', '#1d80a5')
        .attr('opacity', '0.7');

    dotsEnter.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    dots.exit().remove();
}

function brushstart(cell) {
    yScaleFilter.domain(extentByAttribute[cell]);
    // if (brushCell != this) {
    //     brush.move(d3.select(brushCell), null);
    //
    //     xScaleFilter.domain(extentByAttribute[cell]);
    //
    //     brushCell = this;
    // }
}

function brushmove(cell) {
    var e = d3.event.selection;
    if(e) {
        usColleges.forEach(function(d) {
            if (e[0] > yScaleFilter(d[cell]) || e[1] < yScaleFilter(d[cell])) {
                d[cell + '_show'] = false;
            } else {
                d[cell + '_show'] = true;
            }
        })
        updateDots()
    }
}

function brushend() {
    if (!d3.event.selection) {
        usColleges.forEach(function(d) {
            filterAttributes.forEach(function(attribute) {
                d[attribute + '_show'] = true;
            })
        })
        updateDots()
        brushCell = undefined;
    }
}
