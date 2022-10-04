// Load the modules
var express = require('express'); //Express - a web application framework that provides useful utility functions like 'http'
var app = express();
var bodyParser = require('body-parser'); // Body-parser -- a library that provides functions for parsing incoming requests
app.use(bodyParser.json());              // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies
const axios = require('axios');
const qs = require('query-string');
const cors = require('cors');
app.use(cors());
var pgp = require('pg-promise')();
const { ENGINE_METHOD_ALL } = require('constants');

const dev_dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'cocktail_db',
	user: 'postgres',
	password: 'pwd'
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
  pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}
//const isProduction = process.env.NODE_ENV === 'production';
//dbConfig = isProduction ? process.env.DATABASE_URL : dbConfig;
//let db = pgp(dbConfig);

const db = pgp(dbConfig);

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));// Set the relative path; makes accessing the resource directory easier

//main page
app.get('/', function(req, res) {
  res.render('pages/main', {
    my_title: "Cocktail search",
    item: '',
    error: false,
    message: ''
  });
});

//to request data from API for given search criteria
//TODO: You need to edit the code for this route to search for movie reviews and return them to the front-end
app.post('/get_feed', cors(), function(req, res) {
  console.log("request parameters: ", req)
  var name = req.body.name; //TODO: Remove null and fetch the param (e.g, req.body.param_name); Check the NYTimes_home.ejs file or console.log("request parameters: ", req) to determine the parameter names
  if(name) {
    axios({
      url: `http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`,
        method: 'GET',
        dataType:'json',
      })
        .then(item => {
          // TODO: Return the reviews to the front-end (e.g., res.render(...);); Try printing 'items' to the console to see what the GET request to the Twitter API returned.
          // Did console.log(items) return anything useful? How about console.log(items.data.results)?
          // Stuck? Look at the '/' route above
          res.render('pages/main', {
              my_title: "Cocktail Search",
              item: item.data.drinks[0],
              message: "",
              error:false
          })
          console.log("items: ",item);
	        console.log("data: ",item.data.drinks[0]);

        })
        .catch(error => {
          console.log(error);
          res.render('pages/main',{
            my_title: "Cocktail Search",
            item: '',
            error: true,
            message: 'error'
          })
        });


  }
  else {
    res.render('pages/main',{
      my_title: "Cocktail Search",
      item: '',
      error: true,
      message: 'Error: Please enter a cocktail name'
    })
    // TODO: Render the home page and include an error message (e.g., res.render(...);); Why was there an error? When does this code get executed? Look at the if statement above
    // Stuck? On the web page, try submitting a search query without a search term
  }
});

app.get('/pages/reviews', function(req, res) {
	var reviews = `select * from CocktailTable;`;// Write a SQL query to retrieve the colors from the database
	db.task('get-everything', task => {
        return task.batch([
            task.any(reviews),
        ]);
    })
    .then(info => {
    	res.render('pages/reviews',{
				my_title: "Reviews",
				data: info[0],
			})
      console.log("DATA:",info[0]);
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/reviews', {
                my_title: 'Reviews',
                data: '',
            })
    });

});


app.post('/add_review', function(req, res) {
  var id = req.body.drink_id;
	var name = req.body.drink_name;
	var review = req.body.review;
  //var review_date = current_timestamp;
	var insert_statement = "INSERT INTO CocktailTable(id, cocktail_title, review, review_date) VALUES($1, $2, $3,current_timestamp);";

	db.task('get-everything', task => {
		return task.batch([
			task.any(insert_statement, [id, name, review]),
		]);
	})
    .then(info => {
    	res.redirect('/pages/reviews');
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/reviews', {
                my_title: 'Reviews Page',
                data: '',
            })
    });
});

app.get('/filter_reviews', function(req, res) {
  var filter_drink = req.query.filter_drink;
  console.log(filter_drink)
    var filtered_reviews = `select * from CocktailTable where cocktail_title = '${filter_drink}' UNION ALL select * from CocktailTable where NOT EXISTS (select * from CocktailTable where cocktail_title = '${filter_drink}');`; 
	db.task('get-everything', task => {
        return task.batch([
            task.any(filtered_reviews),
        ]);
    })
    .then(info => {
    	res.render('pages/reviews',{
				my_title: "Reviews Page",
				data: info[0],
        filter: filter_drink,
			})
      console.log("Data:", info[0]);
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/reviews', {
                my_title: 'Reviews Page',
                data: '',
                filter: '',
            })
    });

});



//app.listen(3000);
//console.log('3000 is the magic port');
//app.listen(3000);
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
	console.log(`Express running → PORT ${server.address().port}`);
});
