/**
 * Copyright © 2016 LTV Co., Ltd. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by luc <tin@ltv.vn> on Jan 04, 2018
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const relationship = require("mongoose-relationship");

const listCoinBittrexSchema = new mongoose.Schema({
  marketNn : String,
  enterPrice : Number,
  lastTime: Number,
  matchPrice: Number,

  bbvalue: Number,
  bvolume : Number,
  spread: Number,
  candle: String,
  trend: String,
  ask: Number,
  bid: Number,
  highVl: Number,
  lowVl: Number,
  lastVl: Number,
  openBuyOrder: Number,
  openSellOrder: Number,
  timeMarket: String,
}, { timestamps: true });

//listCoinBittrexSchema.plugin(relationship, { relationshipPathName: 'user' });
const ListCoinBittrex = mongoose.model('ListCoinBittrex', listCoinBittrexSchema);

module.exports = ListCoinBittrex;
