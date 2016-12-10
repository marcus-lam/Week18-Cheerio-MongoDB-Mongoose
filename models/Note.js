// Require Mongoose.
var mongoose = require("mongoose");

// Create Schema.
var Schema = mongoose.Schema;

// Create the Note Schema.
var NoteSchema = new Schema({
  name: {
    type: String
  },
  comment: {
    type: String
  }
});
// Mongoose will automatically save the ObjectIds of the Notes.
// These IDs are referred to in the Article model.

// Create the Note model with the NoteSchema.
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model.
module.exports = Note;