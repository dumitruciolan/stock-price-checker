"use strict";

const Stock = require("../models/stockModel"),
  fetch = require("node-fetch");

// Obtain the data from external api
const getStockData = async (like, stock, ip) => {
  const stockData = await fetch(
      `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
    ).then(response => response.json()),
    stockLikes = await getLikes(stock, like, ip);
  // return the data in the required format
  return {
    stock: stockData.symbol,
    price: stockData.latestPrice.toString(),
    likes: parseInt(stockLikes, 10)
  };
};

const getLikes = (stock, like, ip) => {
  // like provided?
  if (like) {
    return new Promise((resolve, reject) => {
      Stock.findOneAndUpdate(
        { name: stock },
        { $addToSet: { likes: ip } },
        { upsert: true }, //
        (err, response) => {
          if (err) reject[err];
          if (response) resolve(response.likes.length);
        }
      );
    });
    // return the matching document
    return new Promise((resolve, reject) => {
      Stock.findOne({ name: stock }, (err, response) => {
        if (err) reject[err];
        if (response) resolve(response.likes.length);
      });
    });
  }
};

module.exports = app => {
  app.route("/api/stock-prices").get(async (req, res) => {
    const { stock, like } = req.query;
    let likes = req.query.like === "true";

    // get the ip address
    const ip = req.ip || (req.headers["x-forwarded-for"] || "").split(",")[0];

    // compare two stocks
    if (Array.isArray(stock)) {
      try {
        const stockData = await Promise.all(
          stock.map(async stockItem => {
            const data = await getStockData(like, stockItem.toUpperCase(), ip);
            return data;
          })
        );

        // calculate and add "rel_likes"
        stockData.forEach((data, index) => {
          const relIndex = 1 % index == 0 ? 0 : 1;
          return (stockData[index].rel_likes =
            stockData[index].likes - stockData[relIndex].likes);
        });

        // remove likes field
        delete stockData[0].likes;
        delete stockData[1].likes;
        res.status(200).json({ stockData });
      } catch {
        res.status(400).send("The stock(s) could not be found");
      } // return data for one stock
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
