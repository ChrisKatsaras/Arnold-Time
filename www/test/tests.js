var request = require('supertest');
var server = request.agent("http://localhost:3000");


describe("Get Requests", function(){
	it('Should return the home page', function(done) {
    server
      .get('/')
      .expect(200, done);
  });
});

describe("Post Requests", function(){
	it("Should login the user into the game",function(done){
        server
        .post("/login")
        .send({id: "Chris", token: "9834be406e2d6b3ccf5d7cddee4c7c2cc8b2a4b9bb215d51b429e44dd603e2b936e43e66967ae3762119c3fd6cf7dd51", fp: "82e00de76cf35f4937b7ecfd3199d163"})
        .expect("Content-type",/json/)
        .expect(200)
        .end(function(err,res){
            done();
        });
    });
});
