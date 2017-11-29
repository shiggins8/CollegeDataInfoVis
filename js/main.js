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
    sat_average: 'SAT Average',
    undergrad_pop: 'Undergraduate Population'
}

var regionKey = {
    admission_rate: 'Admission Rate',
    act_median: 'ACT Median',
    sat_average: 'SAT Average',
    undergrad_pop: 'Undergraduate Population'
}

var colorKey = {
    'Southwest': '#F29262', //orange
    'Rocky Mountains': '#98C793', //green
    'Mid-Atlantic': '#F9C862', //yellow
    'Great Lakes': '#EC5F67', //red
    'Southeast': '#68B0AF', //blue-green
    'Great Plains': '#669ACC', //blue
    'New England': '#ff9999', //pink
    'Far West': '#C593C4' //purple
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

var line = d3.line();
var foreground;
var background;

var paralelCoordinateBrushes = {
    admission_rate: null,
    act_median: null,
    sat_average: null,
    undergrad_pop: null
}

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

    extents = filterAttributes.map(function(p) { return [0,0]; });

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
    collegeList = svg.append('g')
        .attr('class', 'collegeList')
        .attr('transform', 'translate(' + [svgWidth - (svgWidth/4), padding.t] + ')')

    collegeList.append('rect')
        .attr('width', compareWidth)
        .attr('height', compareHeight)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', '1.5')
        .attr('stroke-opacity', '0.1');

    // parallel coordinates bottom rectangle
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

    background = filterColleges.append('g')
        .attr('class', 'background')
        .selectAll('path')
        .data(usColleges)
        .enter()
        .append('path')
        .attr('d', function(d) {
            return line(filterAttributes.map(function(attribute, i) {
                return [xScaleFilter(i), y[attribute](d[attribute])];
            }));
        });

    foreground = filterColleges.append('g')
        .attr('class', 'foreground')
        .selectAll('path')
        .data(usColleges)
        .enter()
        .append('path')
        .attr('d', function(d) {
            return line(filterAttributes.map(function(attribute, i) {
                return [xScaleFilter(i), y[attribute](d[attribute])];
            }));
        })
        .attr('stroke', function(d) {
            return colorKey[d.region]
        });

    var attributeG = filterColleges.selectAll('.attribute')
        .data(filterAttributes)
        .enter()
        .append('g')
        .attr('class', 'attribute')
        .attr('transform', function(attribute, i) {
            return 'translate(' + xScaleFilter(i) + ')';
        });

    var axes = attributeG.append('g')
        .attr('class', 'axis')
        .each(function(attribute) {
            d3.select(this).call(yAxisFilter.scale(y[attribute]));
        });

    axes.append('g')
        .attr('class', 'brush')
        .each(function(attribute) {
            d3.select(this).call(y[attribute].brush);
        });

    updateDots();
    updateList();
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
        .attr('class', 'dot');

    dotsEnter.merge(dots)
        .attr('transform', function(d) {
            cx = projection([d.longitude, d.latitude])[0]
            cy = projection([d.longitude, d.latitude])[1]
            return 'translate(' + [cx, cy] + ')'
        });

    dotsEnter.append('circle')
        .attr('r', 2.5)
        .attr('fill', function(d) {
            return colorKey[d.region]
        })
        .attr('opacity', '0.7');

    dotsEnter.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    dots.exit().remove();
}

function updateList() {
    var showColleges = usColleges.filter(function(d) {
        return d.admission_rate_show && d.act_median_show && d.sat_average_show && d.undergrad_pop_show;
    })

    showColleges = showColleges.sort(function(a,b) {
        return a.name - b.name;
    })

    var collegeList = svg.selectAll('.collegeList')

    var collegeNames = collegeList.selectAll('.collegeName')
        .data(showColleges, function(d) {
            return d.name;
        })

    var namesEnter = collegeNames.enter()
        .append('g')
        .attr('class', 'collegeName');

    collegeNames.merge(namesEnter)
    .attr('transform', function(d,i){
        return 'translate('+[10, (i*15) + 20]+')'; // Update position based on index
    });

    namesEnter.append('text')
        .attr('class', 'collegeNameText')
        .text(function(d) {
            return d.name;
        })

    collegeNames.exit().remove();
}

function path(d) {
    return line(filterAttributes.map(function(attribute, i) { return [xScaleFilter(i), y[attribute](d[attribute])]; }));
}

function brushstart(cell) {
    yScaleFilter.domain(extentByAttribute[cell]);
    filterAttributes.forEach(function(attribute) {
        if (d3.event.target == y[attribute].brush) {
            paralelCoordinateBrushes[attribute] = 'active';
        }
    })
}

function brushmove(cell) {
    for (var i = 0; i < filterAttributes.length; ++i) {
        if (d3.event.target == y[filterAttributes[i]].brush) {
            extents[i] = d3.event.selection.map(y[filterAttributes[i]].invert, y[filterAttributes[i]]);
        }
    }

    var e = d3.event.selection;
    if(e) {
        usColleges.forEach(function(d) {
            if (e[0] > yScaleFilter(d[cell]) || e[1] < yScaleFilter(d[cell])) {
                d[cell + '_show'] = false;
            } else {
                d[cell + '_show'] = true;
            }
        })
        updateDots();
        updateList();
    }

    updateLines()
}

function brushend() {
    if(!d3.event.selection) {
        for (var i = 0; i < filterAttributes.length; ++i) {
            if (d3.event.target == y[filterAttributes[i]].brush) {
                paralelCoordinateBrushes[filterAttributes[i]] = null;
                extents[i] = [0,0]
            }
        }
        if (noActiveBrushes()) {
            clearAllGray();
        }
        usColleges.forEach(function(d) {
            filterAttributes.forEach(function(attribute) {
                d[attribute + '_show'] = true;
            })
        })
        updateDots();
        updateList();
        updateLines();
    }
}

function updateLines() {
    foreground.style("display", function(d) {
        return filterAttributes.every(function(p, i) {
            if (extents[i][0] == 0 && extents[i][1] == 0) {
                return true;
            }
            return extents[i][1] <= d[p] && d[p] <= extents[i][0];
        }) ? null : "none";
    });
}

function noActiveBrushes() {
    return paralelCoordinateBrushes.admission_rate == null && paralelCoordinateBrushes.act_median == null && paralelCoordinateBrushes.sat_average == null && paralelCoordinateBrushes.undergrad_pop == null
}

function clearAllGray() {
    d3.selectAll("g.foreground path").style("display", null);
}
