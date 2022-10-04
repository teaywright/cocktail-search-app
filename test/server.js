const server = require("../server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven 
// development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

  describe("GET /filter_reviews", function(){
    it("filter drink margarita", (done) => {
      chai
        .request(server)
        .get("/filter_reviews")
        .end((err, res) => {
          expect(res.query.filter_drink).to.be.a('string');
          done();
        });
    });
  });
  
  describe("POST /add_review", function(){
    it("id equal to 11007", (done) => {
      chai
        .request(server)
        .post("/add_review")
        .end((err, res) => {
          expect(res.body.drink_id).to.equal(11007);
          done();
        });
    });
  });
