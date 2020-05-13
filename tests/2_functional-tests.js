/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const server = require("../server");
const chaiHttp = require("chai-http");
const chai = require("chai");
const { assert } = chai;

chai.use(chaiHttp);

let likes;
let stock0Likes;
let stock1Likes;

const properties = ["stock", "price", "likes"];
const propertiesDouble = ["stock", "price", "rel_likes"];

suite("Functional Tests", () => {
  suite("GET /api/stock-prices => stockData object", () => {
    test("1 stock", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.stockData);
          properties.forEach(property =>
            assert.property(res.body.stockData, property)
          );
          assert.equal(res.body.stockData.stock, "GOOG");
          done();
        });
    });

    test("1 stock with like", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "msft", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.stockData);
          properties.forEach(property =>
            assert.property(res.body.stockData, property)
          );
          assert.equal(res.body.stockData.stock, "MSFT");
          assert.isAbove(res.body.stockData.likes, 0);
          likes = res.body.stockData.likes;
          done();
        });
    });

    test("1 stock with like again (ensure likes arent double counted)", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "msft", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.stockData);
          properties.forEach(property =>
            assert.property(res.body.stockData, property)
          );
          assert.equal(res.body.stockData.stock, "MSFT");
          assert.equal(res.body.stockData.likes, likes);
          done();
        });
    });

    test("2 stocks", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end((err, res) => {
          stock0Likes = res.body.stockData.likes;
        });

      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "msft" })
        .end((err, res) => {
          stock1Likes = res.body.stockData.likes;
        });

      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.stockData);
          propertiesDouble.forEach(property => {
            assert.property(res.body.stockData[0], property);
            assert.property(res.body.stockData[1], property);
          });
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.equal(res.body.stockData[1].stock, "MSFT");
          done();
        });
    });

    test("2 stocks with like", done => {
      let stock0LikesCurrent;
      let stock1LikesCurrent;

      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end((err, res) => {
          stock0LikesCurrent = res.body.stockData.likes;
        });

      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "msft" })
        .end((err, res) => {
          stock1LikesCurrent = res.body.stockData.likes;
        });

      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"], like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.stockData);
          propertiesDouble.forEach(property => {
            assert.property(res.body.stockData[0], property);
            assert.property(res.body.stockData[1], property);
          });
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.isAbove(stock0LikesCurrent, 0);
          assert.isAbove(stock1LikesCurrent, 0);
          stock0Likes = stock0LikesCurrent;
          stock1Likes = stock1LikesCurrent;
          done();
        });
    });

    let stock0LikesCurrent;
    let stock1LikesCurrent;

    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "goog" })
      .end((err, res) => {
        stock0LikesCurrent = res.body.stockData.likes;
      });

    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "msft" })
      .end((err, res) => {
        stock1LikesCurrent = res.body.stockData.likes;
      });

    test("2 stocks with likes again (ensure likes arent doubled)", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"], like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.stockData);
          propertiesDouble.forEach(property => {
            assert.property(res.body.stockData[0], property);
            assert.property(res.body.stockData[1], property);
          });
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.equal(stock0LikesCurrent, stock0Likes);
          assert.equal(stock1LikesCurrent, stock1Likes);
          done();
        });
    });
  });
});
