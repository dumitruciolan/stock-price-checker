"use strict";

const mongoose = require("mongoose");

// set user schema & model
const StockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    likes: { type: [String], default: [] }
  }),
  Stock = mongoose.model("Stock", StockSchema);

// connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// export model so we can access it from api.js
module.exports = mongoose.model("Stock", StockSchema);
