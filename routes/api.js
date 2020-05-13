"use strict";

const { expect } = require("chai");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

// mongo db model
const StockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    likes: { type: [String], default: [] }
  }),
  Stock = mongoose.model("Stock", StockSchema);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

async function getStockPrice(stock) {
  const fetchResponse = await fetch(
    `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
  ).then(response => response.json());
}

async function addToStocksDB(stock, like) {
  const returnedStock = await getStockPrice(stock);
  const { symbol, price } = returnedStock;
}

const getLikes = (stock, like, ip) => {
  if (like) {
    return new Promise((resolve, reject) => {
      Stock.findOneAndUpdate(
        { name: stock },
        { $addToSet: { likes: ip } },
        { new: true, upsert: true },
        (err, response) => {
          if (err) reject[err];
          if (response) resolve(response.likes.length);
        }
      );
    });

    return new Promise((resolve, reject) => {
      Stock.findOne({ name: stock }, (err, response) => {
        if (err) reject[err];
        if (response) resolve(response.likes.length);
        resolve(0);
      });
    });
  }
};

const getStockData = async (like, stock, ip) => {
  const stockData = await getStockPrice(stock);
  const stockLikes = await getLikes(like, stock, ip);

  return {
    stock: stockData.symbol,
    price: stockData.latestPrice.toString(),
    likes: parseInt(stockLikes, 10)
  };
};

module.exports = app => {
  app.route("/api/stock-prices").get(async (req, res) => {
    const { stock, like } = req.query;

    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    if (Array.isArray(stock)) {
      try {
        const stockData = await Promise.all(
          stock.map(async stockItem => {
            const data = await getStockData(like, stockItem, ip);
            return data;
          })
        );

        stockData.forEach((data, index) => {
          const relIndex = 1 % index == 0 ? 0 : 1;

          return (stockData[index].rel_likes =
            stockData[index].likes - stockData[relIndex].likes);
        });

        // alternative to forEach above
        stockData[0].rel_likes = stockData[0].likes - stockData[1].likes;
        stockData[1].rel_likes = stockData[1].likes - stockData[0].likes;
        delete stockData[0].likes;
        delete stockData[1].likes;
        res.status(200).json({ stockData});
      } catch {
        res.status(400).send("The stock(s) could not be found");
      }
    } else {
      try {
        const stockData = await getStockData(like, stock, ip);
        res.status(200).json({ stockData });
      } catch {
        res.status(400).send("The stock could not be found");
      }
    }
  });
};
