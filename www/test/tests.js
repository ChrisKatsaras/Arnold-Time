var request = require('supertest');
var server = request.agent("http://localhost:3000");
var should = require("should");
var io = require('socket.io-client');


describe("Get Requests", function() {
	it('Should return the home page', function(done) {
    	server
      	.get('/')
      	.expect(200)
      	.end(function(err,res) {
        	res.status.should.equal(200);
        	done();
  	  	});
	});
});

describe("Socket-Server", function () {
  it('user connected and able to send msg through socket.', function (done) {
    var client = io.connect("http://localhost:3000");
    client.on('connect', function (data) {
      done();
    });
  });
});

describe("Post Requests", function(){
	it("Should login the user into the game",function(done) {
        //var client = io.connect("http://localhost:3000");
        server
        .post("/login")
        .send({id: "Chris", token: "9834be406e2d6b3ccf5d7cddee4c7c2cc8b2a4b9bb215d51b429e44dd603e2b936e43e66967ae3762119c3fd6cf7dd51", fp: "82e00de76cf35f4937b7ecfd3199d163"})
        .set('User-Agent', "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36")
        .expect("Content-type",/json/)
        .expect(200)
        .end(function(err,res) {
        	res.status.should.equal(200);
            done();
        });
    });

});