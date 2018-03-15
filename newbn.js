const binance = require('node-binance-api');
const listcoinBNB = require('./listcoinbinance');
const BB = require('technicalindicators').BollingerBands;
const R = require('ramda');
const fs = require('fs');
const moment = require('moment');


binance.candlesticks("BNBBTC", "15m", (error, ticks, symbol) => {
  console.log("candlesticks()", ticks);
  ticks.forEach(item => {
    console.log("candlesticks()", item);
  });
  let last_tick = ticks[ticks.length - 1];
  let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
  console.log(symbol + " last close: " + close);
}, {startTime:1514763900000, endTime: 1514764800000});