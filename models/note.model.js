// models/note.js

const mongoose = require('mongoose');


const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

noteSchema.index({ title: 'text', content: 'text' }); // Enable text search

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
