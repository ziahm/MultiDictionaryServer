var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence');

var Schema = mongoose.Schema;

var wordSchema = mongoose.Schema({  
  _id:{ type: Number, default: 1 },
  name: String,
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
  }, { 
  retainKeyOrder: true,
   _id: false
});

wordSchema.plugin(AutoIncrement, {id: 'word_id_counter', inc_field: '_id'})

module.exports = mongoose.model('words', wordSchema);