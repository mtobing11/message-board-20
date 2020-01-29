var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise; // just to fix the depricate message that always show up

var threadsSchema = new Schema({
  text: String,
  created_on: {type: Date, default: new Date()},
  bumped_on: {type: Date, default: new Date()},
  reported: {type: Boolean, default: false},
  delete_password: String,
  replies : [{type: Schema.Types.ObjectId, ref:'Reply'}],
  replycount: {type: Number, default:0},
  board: String
})

// threadsSchema.pre('remove',function(done){
//   const Board = mongoose.model('Board');
//   const boardPromise = Board.findOneAndUpdate({board: this.board},{$pull:{
//     threads: this._id
//   }});
//   Promise.all([boardPromise])
//   .then(()=> done())
//   .catch(err=>{throw err})
// })

var Thread = mongoose.model('Thread',threadsSchema)
module.exports = Thread;