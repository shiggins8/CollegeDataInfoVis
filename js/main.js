// InfoVis Final Project (P5)
// Author1: Stacee Freeman
// Author2: Scott Higgins
// CS 4460, Fall 2017

var svg = d3.select('svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 20, r: 20, b: 40, l: 250};
var plotPadding = 50;
// var chartG = svg.append("g").attr("transform", "translate(" + padding.l + "," + padding.t + ")");

var projection = d3.geoAlbersUsa()
    .scale(800)
    .translate([svgWidth/2,200]);
var path = d3.geoPath()
    .projection(projection);

d3.json("./data/us.json", function(error, us) {
  svg.append("path")
      .attr("class", "states")
      .datum(topojson.feature(us, us.objects.states))
      .attr("d", path);
});

// College data
d3.csv('./data/colleges.csv',
function(row){
    return {
        name: row['Name'],
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

    colleges = dataset;


});
