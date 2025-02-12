// models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishedYear: { type: Number },
});

const BookModel = mongoose.model('Book', BookSchema);

module.exports = BookModel;
