var Nightmare = require('nightmare');
var vo = require('vo');
var fs = require('fs');

vo(run)(function(err, result) {
    if (err) throw err;
});

//currently the script runs only with defined MAX_PAGE
function * run() {
    var nightmare = Nightmare();
    var firstYear = 1950;
    var lastYear = 2010;
    var currentYear = firstYear;
    var data = [];

    while (currentYear <= lastYear) {

      console.log('[Y] ----- ' + currentYear + ' -------------------');
      url = 'https://de.m.wikipedia.org/wiki/' + currentYear.toString() + 'er';

      yield nightmare
        .goto(url)
        .wait('.mf-section-1')
        .evaluate(function(year) {

          var alben = [];
          var events = [];
          var yearRx = /\d{4}/g;

          $('#Ereignisse').parent('h2').next('div').find('ul li').each(function(){
            var event = new Object();
            event.decade = year;
            event.text = $(this).text();

            if(event.text.match(yearRx)){
              match = event.text.match(yearRx);
              event.year = match[0];
            }

            events.push(event);
          });

          return events;

        }, currentYear)
        .then(function(events){
          console.dir(events);
          data = data.concat(events);
        })
        .catch(function(error) {
          console.error('error', error);
        });
        currentYear = currentYear + 10; //50 60 70 80 90 ..
    }





    console.dir(data);
    data = JSON.stringify(data, null, 2)

    //write results to timestamped json file
    results = './results'

    if(!fs.existsSync(results)){
        fs.mkdirSync(results);
    }
    fs.writeFile('results/output.json', data, 'utf8');
    yield nightmare.end();
}
