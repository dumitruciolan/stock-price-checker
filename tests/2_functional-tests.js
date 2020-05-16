// --------[Keep the tests in the same order!]--------
// if additional are added, keep them at the very end!

const chaiHttp = require("chai-http"),
  server = require("../server"),
  chai = require("chai"),
  { assert } = chai;
let likes;

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("GET /api/stock-prices => stockData object", () => {
    test("Functional test 1: 1 stock", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, "stock");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "likes");
          assert.equal(res.body.stockData.stock, "GOOG");
          done();
        });
    });

    test("Functional test 2: 1 stock with like", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "MSFT", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, "stock");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "likes");
          assert.equal(res.body.stockData.stock, "MSFT");
          assert.isAbove(res.body.stockData.likes, 0);
          likes = res.body.stockData.likes;
          done();
        });
    });

    test("Functional test 3: 1 stock with like again (ensure likes arent double counted)", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, "stock");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "likes");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.equal(res.body.stockData.likes, likes);
          done();
        });
    });

    test("Functional test 4: 2 stocks", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["intl", "amzn"] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "rel_likes");
          assert.property(res.body.stockData[1], "stock");
          assert.property(res.body.stockData[1], "price");
          assert.property(res.body.stockData[1], "rel_likes");
          assert.equal(res.body.stockData[0].stock, "INTL");
          assert.equal(res.body.stockData[1].stock, "AMZN");
          done();
        });
    });

    test("Functional test 5: 2 stocks with like", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["amd", "ibm"], like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "rel_likes");
          assert.property(res.body.stockData[1], "stock");
          assert.property(res.body.stockData[1], "price");
          assert.property(res.body.stockData[1], "rel_likes");
          assert.equal(res.body.stockData[0].stock, "AMD");
          assert.equal(res.body.stockData[1].stock, "IBM");
          done();
        });
    });
  });
});
