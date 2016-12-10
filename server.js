// Dependencies
var bodyParser = require("body-parser");
var express = require("express");
var mongoose = require("mongoose");

// Requiring the Note and Article models.
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Scraping Tools
var request = require("request");
var cheerio = require("cheerio");

// Mongoose mpromise deprecated; using bluebird instead.
var Promise = require("bluebird");
mongoose.Promise = Promise;


// Initializing Express.
var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

// Making "public" a static directory.
app.use(express.static("public"));

// Database configuration with Mongoose.
mongoose.connect("mongodb://localhost/mongoose_hw");
var db = mongoose.connection;

// Show any Mongoose errors.
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through Mongoose, log a success message.
db.once("open", function() {
  console.log("Mongoose connection successful!");
});


// Routes
// ======

// Simple index route.
app.get("/", function(req, res) {
  res.send(index.html);
});

// A GET request to scrape The Onion's website.
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request.
  request("http://www.theonion.com/section/science-technology/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector.
    var $ = cheerio.load(html);
    // Now, we grab every div with an "inner" class, and do the following:
    $("div .inner").each(function(i, element) {
      // Create an empty "result" object.
      var result = {};
      // Add the title, link, summary and image of every hit, and save them as properties of the result object.
      result.title = $(this).children("header").children(".headline").children("a").attr("title");
      result.link = "www.theonion.com" + $(this).children("header").children(".headline").children("a").attr("href");
      result.summary = $(this).children(".desc").text().trim();
      result.image = $(this).siblings(".thumb").find("img").attr("src");
      if (result.title == "" || result.summary == "") {
        console.log("Missing required data.");
      } else {
        // Create a new entry using our Article model.
        var entry = new Article(result);
        // Now, save that entry to the db.
        entry.save(function(err, doc) {
          // Log any errors; log the doc otherwise.
          if (err) {
            console.log(err);
          } else {
            console.log(doc);
          }
        });
      }
    });
  });
  // Tell the browser that we finished scraping.
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the db.
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array.
  Article.find({}, function(error, doc) {
    // Log any errors. Otherwise, send the doc to the browser as a JSON object.
    if (error) {
      console.log(error);
    } else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId.
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it.
  .populate("note")
  // Now, execute our query.
  .exec(function(error, doc) {
    // Log any errors. Otherwise, send the doc to the browser as a JSON object.
    if (error) {
      console.log(error);
    } else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note.
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry.
  var newNote = new Note(req.body);
  // And save the new note to the db.
  newNote.save(function(error, doc) {
    // Log any errors.
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update its note.
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query.
      .exec(function(err, doc) {
        // Log any errors. Otherwise, send the doc to the browser.
        if (err) {
          console.log(err);
        } else {
          res.send(doc);
        }
      });
    }
  });
});


// Listen on PORT.
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("App running on " + PORT + "!");
});