var expect  = require('chai').expect;
var request = require('supertest');
var server = request.agent("http://localhost:3000");


describe("Get Requests",function(){
	it('respond with json', function(done) {
    server
      .get('/')
      .expect(200, done);
  });
})