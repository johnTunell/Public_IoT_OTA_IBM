var cheerio = require('cheerio'),
    fs = require('fs');

exports.getSensorData = (data) => {

    $ = cheerio.load("" + data);

    let sensor_data = {};
    let sensor_data_array = [];

    let attrNames = [];

    $('.row_first > td').each(function (i, elem) {
        attrNames.push($(elem).html());
    });

    let currentObject = {};


    for (let i = 0; i < $('tbody > tr').length; i++) {
        currentObject = {};
        $($('tbody > tr')[i]).find('td').each(function (j, elem2) {
            if ($(elem2).has('a').length === 0) {
                let data = $(elem2).html();
                currentObject[attrNames[j]] = data;
            } else {
                let data = $(elem2).find('a').html();
                currentObject[attrNames[j]] = data;
            }
        });
        sensor_data_array.push(currentObject);
    }

    console.log(sensor_data_array);

    for (let i = 0; i < sensor_data_array.length; i++) {
        sensor_data_array[i].type = 'fullsens';
        sensor_data_array[i].id = sensor_data_array[i].Node.replace(/:/g, "");
        sensor_data_array[i].id.slice(4,sensor_data_array["0"].id.length);

        let first_part = sensor_data_array[i].id.slice(4,sensor_data_array["0"].id.length).substr(0,6);
        first_part = first_part.replace('2','0');
        let second_part = sensor_data_array[i].id.slice(4,sensor_data_array["0"].id.length).substr(9,6);

        let complete = first_part + second_part;

        sensor_data_array[i].id = complete;

        delete sensor_data_array[i].Node;

        delete sensor_data_array[i].Type;
    }

    return sensor_data_array;

}

