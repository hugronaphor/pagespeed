var express = require('express');
var router = express.Router();

var testedURL = 'http://cornel.co';
var dbCollection = 'psi_result';

/* GET home page. */ // Original
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

/* GET home page. */
router.get('/', function (req, res) {
    var db = req.db;
    var collection = db.get(dbCollection);
    collection.find({}, {}, function (e, docs) {
        console.log(docs)
        res.render('index', {
            "results": docs
        });
    });
});

/* POST to Add User Service */
router.post('/', function (req, res) {

    var psiOptions = {
        //key : '', // Google API Key. By default the free tier is used.
        strategy: 'mobile', // Strategy to use when analyzing the page: mobile|desktop
        format: 'json', // Output format: cli|json|tap
        //locale : '', // Locale results should be generated in.
        //threshold : '', // Threshold score to pass the PageSpeed test.
    };

    // Get our form url value. These rely on the "name" attributes.
    // @todo: clean the string.
    var url = req.body.url;
    psi = req.psi;


    // get the PageSpeed Insights report.
    psi(url, psiOptions, function (err, data) {
        if (err) {
            console.log('PSI request error.');
            //res.writeHead(500, {'Content-Type': 'text/plain'});
            // If it failed, return error
            //res.send("There was a problem adding the information to the database.");
            // early return to avoid an else block
            return res.end(err.message);
        }
        else {
            saveData(data, req, url);
            //res.writeHead(200, {'Content-Type': 'text/plain'});
            // write the new url to the response
            res.redirect('/');
        }
    });
})
;

var saveData = function (psiData, req, url) {
    // Set our internal DB variable.
    var db = req.db;

    // Set our collection.
    var collection = db.get(dbCollection);

    // Submit to the DB.
    collection.insert({
        "url": url,
        "score": psiData.score,
        "time": Date.now(),
        "data": psiData.pageStats
    }, function (err, doc) {

        // handle the error case properly
        if (err) {
            //res.writeHead(500, {'Content-Type': 'text/plain'});
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
            // early return to avoid an else block
            return res.end(err.message);
        }
    });
}

module.exports = router;
