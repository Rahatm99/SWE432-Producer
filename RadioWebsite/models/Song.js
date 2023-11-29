const mongoose = require('mongoose');
// define a schema that maps to the structure of the data in MongoDB
const songSchema = new mongoose.Schema({
    name: String
  });
 // now create model using this schema that maps to books collection in database
 module.exports = mongoose.model('Song', songSchema,'songs');