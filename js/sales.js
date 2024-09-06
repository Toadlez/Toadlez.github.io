// the ID of the google sheet, found in the URL
const SHEET_ID = '13oh8qw4J2Nxq04oHI64_czDPN-xmUeFnEYhF-dbks2s';

const BASE = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;

const QUERY_STRING = 'SELECT * ORDER BY G ASC';
const QUERY = encodeURIComponent(QUERY_STRING);
var QUERY_RESULT = [];

const URL = `${BASE}?tq=${QUERY}`;



document.addEventListener('DOMContentLoaded', init);
function init()
{
    google.charts.load('current', {'packages':['calendar']});


    fetch(URL)
    .then(res => res.text())
    .then(rep => {
        const JSON_DATA = JSON.parse(rep.substring(47).slice(0, -2));

        // get table columns
        const COLUMNS = [];
        JSON_DATA.table.cols.forEach((heading,i)=>{
            if (heading.label) {
                var COLUMN_NAME = heading.label.toLowerCase().replace(/\s/g, '_');

                // special cases
                if (i == 0) {COLUMN_NAME = "searchurl"}
                if (i == 1) {COLUMN_NAME = "name"}

                COLUMNS.push(COLUMN_NAME);
            }
        })

        // get table rows
        JSON_DATA.table.rows.forEach((main)=>{
            const ROW = {};

            if (!(main.c[1])) return;

            COLUMNS.forEach((col_name,i)=>{
                ROW[col_name] = main.c[i];
            })

            QUERY_RESULT.push(ROW);
        })


        addSalesTableRows(QUERY_RESULT);
        addFilterOptions(QUERY_RESULT);
    })
}


function addSalesTableRows(result)
{
    const table = document.getElementById("sales_body");

    
    result.forEach((row_data,i)=>{
        var row = table.insertRow();
        row.setAttribute("class", "game_row game:" + row_data.name.v);

        addSalesTableGameCell(row, row_data.name.v, "left", "");
        addSalesTableGameCell(row, "$" + row_data.price.v, "center", "");
        addSalesTableGameCell(row, "$" + row_data.sale_price.v, "center", "");
        addSalesTableGameCell(row, "$" + row_data.delta.v, "center", "");
        addSalesTableGameCell(row, Math.round(row_data['%_off'].v * 100) + "%", "center", "");
        addSalesTableGameCell(row, row_data.start_date.f, "center", "");
        addSalesTableGameCell(row, row_data.end_date.f, "center", "");
        addSalesTableGameCell(row, row_data.duration.v, "center", "");
        addSalesTableGameCell(row, row_data.round.v, "center", "");
        addSalesTableGameCell(row, row_data.time_since_last.v, "center", "");
        addSalesTableGameCell(row, row_data.sales_event.v, "left", "");
    })
}


function addSalesTableGameCell(row, cell_content, align = null, style = null)
{
    var cell = row.insertCell();
    cell.innerHTML = cell_content;

    if (align) {cell.setAttribute("align", align)}
    if (style) {cell.setAttribute("style", style)}
}


function addFilterOptions(result)
{
    // compile game names to ensure no duplicates
    const GAMES = [];
    result.forEach((row_data)=>{
        // push game to GAMES array if it hasn't already been pushed
        if (GAMES.indexOf(row_data.name.v) == -1)
        {GAMES.push(row_data.name.v)}
    })


    // ensure that game names are alphabetically sorted
    GAMES.sort();
    

    const select_element = document.getElementById("game_filter");

    // add options to select element
    GAMES.forEach((game)=> {
        var option = document.createElement("option");
        option.text = game;
        option.value = "game:" + game;

        select_element.add(option);
    })

    select_element.setAttribute("onChange", `filterSalesTableRows(this.value);`);
}


function filterSalesTableRows(filter = "")
{
    if (filter != "") {console.log("Filtering games to only show " + filter.substring(5) + ".")}
    else {console.log("Filtering games to show all games.")}

    var all_rows = document.getElementsByClassName("game_row");
    var show_rows = document.getElementsByClassName(filter);


    // set the display for all rows
    for (var i = 0; i < all_rows.length; i++) {
        var display = "";
        if (filter != "") {display = "none"}

        all_rows[i].style.display = display;
    }


    // set the display for the rows specified by the filter
    for (var i = 0; i < show_rows.length; i++) {
        show_rows[i].style.display = "";
    }


    createPriceChart(filter.substring(5));
}


function createPriceChart(filter)
{
    if (filter == "") {
        document.getElementById("sale_history").innerHTML = "";
        return;
    }


    var sale_history_data = getSaleDates(filter);


    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'date', id: 'Date' });
    dataTable.addColumn({ type: 'number', id: 'Price' });
    dataTable.addRows(sale_history_data.dates);


    var options = {
        title: filter + ": Sale History",
        colorAxis: {
            minValue: 0,
            maxValue: sale_history_data.max_price
        }
    };


    var chart = new google.visualization.Calendar(document.getElementById('sale_history'));
    chart.draw(dataTable, options);
}


function getSaleDates(game)
{
    const SALE_DATES = [];
    var max_price = 0;

    QUERY_RESULT.forEach((row)=>{
        if (row.name.v == game) {
            var start_date = new Date(Date.parse(row.start_date.f));
            const end_date = new Date(Date.parse(row.end_date.f));


            var loop = 0;
            while (start_date <= end_date && loop < 15)
            {
                loop++;

                SALE_DATES.push([new Date(start_date),  row.sale_price.v]);

                start_date.setDate(start_date.getDate() + 1);
            }
            

            if (row.price.v > max_price)
                max_price = row.price.v;
        }
    })

    console.log(SALE_DATES);
    
    return {
        ['dates']: SALE_DATES,
        ['max_price']: max_price,
    };
}