var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence');

var Schema = mongoose.Schema;


var wordDefinitionSchema = mongoose.Schema({  
  _id:{ type: Number, default: 1 },
  _word : { type: Number, ref: 'words' },
  dictionary_type: String,
  definition: Schema.Types.Mixed,
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
  }, { 
  retainKeyOrder: true,
   _id: false
});

wordDefinitionSchema.plugin(AutoIncrement, {id: 'word_definition_id_counter', inc_field: '_id'})

module.exports = mongoose.model('word_definitions', wordDefinitionSchema);