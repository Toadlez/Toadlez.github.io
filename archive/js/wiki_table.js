// the ID of the google sheet, found in the URL
const SHEET_ID = '1UnlnggIy3bYIZM60s70XEm3TTWj_yBTp';

const BASE = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;

const QUERY_STRING = 'SELECT *';
const QUERY = encodeURIComponent(QUERY_STRING);
var QUERY_RESULT = [];

const URL = `${BASE}?tq=${QUERY}`;



document.addEventListener('DOMContentLoaded', init);
function init()
{
    fetch(URL)
    .then(res => res.text())
    .then(rep => {
        const JSON_DATA = JSON.parse(rep.substring(47).slice(0, -2));
        var OUTPUT = "";

        // get table columns
        const COLUMNS = [];
        JSON_DATA.table.cols.forEach((heading,i)=>{
            if (heading.id) {
                var COLUMN_NAME = heading.id.toLowerCase().replace(/\s/g, '_');

                COLUMNS.push(COLUMN_NAME);
            }
        })

        // get table rows
        JSON_DATA.table.rows.forEach((main)=>{
            const ROW = {};

            if (!(main.c[1]) && !(main.c[2]) && !(main.c[3])) {
                OUTPUT += "<br><br><br>" + main.c[0].v + "<br><br><br><br>";
                return;
            }

            var ROW_OUTPUT = "";
            COLUMNS.forEach((col_name,i)=>{
                if (main.c[i] != null && main.c[i].v != null)
                {
                    var value = main.c[i].v;

                    if (i == 0)
                        ROW_OUTPUT += " || [[" + value + "]]";
                    else if (i == 3)
                        ROW_OUTPUT += " || [" + value + " Catalog]";
                    else if (i == 4)
                        ROW_OUTPUT += " || [" + value + " Itch]";
                    else
                        ROW_OUTPUT += " || " + value;
                }
                else
                {
                    ROW_OUTPUT += " || ";
                }
            })

            OUTPUT += "|-<br>" + ROW_OUTPUT + "<br>";

            QUERY_RESULT.push(ROW);
        })

        document.getElementById("output").innerHTML = OUTPUT;
    })
}