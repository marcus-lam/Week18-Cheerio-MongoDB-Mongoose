// Require Mongoose.
var mongoose = require("mongoose");

// Create Schema.
var Schema = mongoose.Schema;

// Create the Article Schema.
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
    unique: true,
    dropDups: true
  },
  summary: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  // This only saves one note's ObjectId; ref refers to the Note model.
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Create the Article model with the ArticleSchema.
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model.
module.exports = Article;