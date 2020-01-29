/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var mongoose = require("mongoose");
var bcrypt   = require('bcrypt');
var salt     = 12;

mongoose.Promise = global.Promise; // just to fix the depricate message that always show up

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

var Schema = mongoose.Schema;

var Thread = require("../models/thread");
var Reply = require("../models/reply");

var boardSchema = new Schema({
  board: String,
  threads: [{ type: Schema.Types.ObjectId, ref: "Thread" }]
});

var Board = mongoose.model("Board", boardSchema);

module.exports = function(app) {
  app.route("/api/threads/:board")

    .get((req, res) => {
      const board = req.params.board;

      Board.findOne({ board }, (err, doc) => {
        if (err) throw err;
        // console.log(doc)
        Thread.populate(doc, [
            {
               path: "threads", 
               options:{
                sort:{bumped_on:-1},
                limit: 10
               },
               populate : {
                path: "replies",
                options: {
                  sort:{created_on: -1}
                }
               }
            }
          ])
            .then(arr => {
            res.send(arr.threads);
          });
          
        
      });
    })

    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;
    
      var delete_password_bcrypt = bcrypt.hashSync(delete_password,salt)

      Thread.create({ text, delete_password:delete_password_bcrypt, board }, (err, doc) => {
        if (err) throw err;
        
        // var delete_password01 = bcrypt.hashSync(delete_password,salt);
        // console.log(delete_password01);
        // console.log(typeof(delete_password01))
        
        Board.findOneAndUpdate(
          { board },
          { $push: { threads: doc } },
          { new: true, upsert: true },
          (err, data) => {
            if (err) throw err;
            res.redirect("/b/" + board+"/");
          }
        );
      });
    })
  
    .delete((req,res)=>{
      const {board} = req.params;
      const {thread_id, delete_password} = req.body;
    
      // console.log(req.body)
      
      Thread.findById(thread_id, (err,doc)=>{
        if(err) throw err;
        if(!bcrypt.compareSync(delete_password,doc.delete_password)){
          return res.type('text').send('Incorrect Password');
        }
        doc.delete()
        .then(()=>res.send('Success'))
        .catch(err=>{throw err})
      })
    })
  
    .put((req,res)=>{
      var {board} = req.params;
      var {thread_id} = req.body;

      Thread.findByIdAndUpdate(thread_id, {$set:{reported: true}}, (err,doc)=>{
        if(err) throw err;
        res.send('Success')
      })
    
  })
  

  app.route("/api/replies/:board")
  
  .get((req,res)=>{
    var {board} = req.params;
    var { thread_id} = req.query;
    
    // CARA 1, kayak app.route("/api/threads/:board").get()
    
    // Thread.findById(thread_id,(err,doc)=>{
    //   if(err) throw err;
    //   Reply.populate(doc,{
    //     path:'replies',
    //     options:{
    //       sort:{created_on:-1},
    //       limit:3
    //     }
    //   })
    //   .then(docs=>{res.send(docs)})
    //   .catch(err=>{throw err})
    // })
    
    // CARA 2, promise semua
    
    Thread.findById(thread_id)
    .populate({
      path:'replies',
      options:{
        sort:{ created_on:-1},
        limit: 3
      }
    })
    .then(docs=>{
      // console.log(docs);
      return res.send(docs)
    })
    .catch(err=>{throw err})
    
  })
  
  .post((req,res)=>{
    var {board} = req.params;
    var {thread_id, text, delete_password} = req.body;
    // console.log(req.body)
    
    Reply.create({text, delete_password}, (err,doc)=>{
      if(err) throw err;
      Thread.findByIdAndUpdate(thread_id,{$push:{replies: doc},$inc:{replycount:1},$set:{bumped_on: new Date()}},{new:true},(err,data)=>{
        if(err) throw err;
        res.redirect('/b/'+board+'/'+thread_id+'/');
      })
    })
    
  })
  
  .delete((req,res)=>{
    var {board} = req.params;
    var {thread_id,reply_id,delete_password} = req.body;
    
    Reply.findById(reply_id,(err,doc)=>{
      if(err) throw err;
      if(doc.delete_password !== delete_password){
        return res.type('text').send('incorrect password')
      };
      doc.text = '[deleted]';
      doc.save()
      .then(()=>{res.send('success')})
      .catch(err=>{throw err})
    })
  })
  
  .put((req,res)=>{
    var board = req.params;
    var {thread_id, reply_id} = req.body;
    
    Reply.findByIdAndUpdate(reply_id,{$set:{reported:true}},(err,doc)=>{
      if(err) throw err;
      res.type('text').send('Success reported');
    })
  })
  
};
