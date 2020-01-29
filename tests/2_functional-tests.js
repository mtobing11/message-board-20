/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

var board = 'general';
var test_id;
var test_id2;
var test_id3;
var reply_id;
var reply_id2;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('every field filled in', function(done){
        chai.request(server)
        .post('/api/threads/'+board)
        .send({
          text:'Hello World',
          delete_password: 'Hello123'
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          // assert.isNotEmpty(res.text);
          done();
        })
      })
      
      
    });
    
    suite('GET', function() {
      
      test('get the thread',(done)=>{
        chai.request(server)
        .get('/api/threads/'+board)
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body);
          assert.equal(res.body[0].text,'Hello World');
          test_id = res.body[0]._id;
          test_id2 = res.body[1]._id;
          done();
        })
      })
      
    });
    
    suite('DELETE', function() {
      
      test('delete a thread', (done)=>{
        chai.request(server)
        .delete('/api/threads/'+board)
        .send({thread_id:test_id, delete_password:'Hello123'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,'Success');
          done();
        })
      })
      
    });
    
    suite('PUT', function() {
      
      test('report a thread', (done)=>{
        chai.request(server)
        .put('/api/threads/'+board)
        .send({report_id:test_id2})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,'Success');
          done();
        })
      })
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('post a reply',(done)=>{
        chai.request(server)
        .post('/api/replies/'+board)
        .send({thread_id:test_id2, text:'let reply text', delete_password:'password'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          done();
        })
      })
    });
    
    suite('GET', function() {
      
      test('get reply on a thread',(done)=>{
        chai.request(server)
        .get('/api/replies/'+board)
        .query({thread_id:test_id2})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body.replies);
          assert.equal(res.body.replies[0].text,'let reply text');
          reply_id = res.body.replies[0]._id;
          reply_id2 = res.body.replies[1]._id;
          done();
        })
      })
      
    });
    
    suite('PUT', function() {
      
      test('report a reply',(done)=>{
        chai.request(server)
        .put('/api/replies/'+board)
        .query({thread_id:test_id2, reply_id:reply_id})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,'Success reported');
          done();
        })
      })
      
    });
    
    suite('DELETE', function() {
      
      test('delete a reply from a thread',(done)=>{
        chai.request(server)
        .delete('/api/replies/'+board)
        .send({thread_id:test_id2, reply_id:reply_id2, delete_password:'password'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,'success');
          done();
        })
      })
      
    });
    
  });

});
