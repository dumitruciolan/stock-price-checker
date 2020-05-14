"use strict";

const Stock = require("../models/stockModel"),
  fetch = require("node-fetch");

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
  const stockData = await fetch(
    `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
  ).then(response => response.json());
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
    let likes = 0;

    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    if (Array.isArray(stock)) {
      try {
        const stockData = await Promise.all(
          stock.map(async stockItem => {
            const data = await getStockData(like, stockItem.toUpperCase(), ip);
            return data;
          })
        );

        stockData.forEach((data, index) => {
          const relIndex = 1 % index == 0 ? 0 : 1;
          return (stockData[index].rel_likes =
            stockData[index].likes - stockData[relIndex].likes);
        });

        delete stockData[0].likes;
        delete stockData[1].likes;
        res.status(200).json({ stockData });
      } catch {
        res.status(400).send("The stock(s) could not be found");
      }
    } else {
      try {
        const stockData = await getStockData(like, stock.toUpperCase(), ip);
        res.status(200).json({ stockData });
      } catch {
        res.status(400).send("The stock could not be found");
      }
    }
  });
};
