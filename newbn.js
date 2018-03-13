const binance = require('node-binance-api');
const listcoinBNB = require('./listcoinbinance');
const BB = require('technicalindicators').BollingerBands;
const R = require('ramda');
const fs = require('fs');

binance.prevDay(false, (error, prevDay) => {
  let markets = [];
  for ( let obj of prevDay ) {
    let symbol = obj.symbol;
    console.log(symbol+" volume:"+obj.volume+" change: "+obj.priceChangePercent+"%");
    markets.push(symbol);
  }
  binance.websockets.candlesticks(markets, '1m', (candlestickData) => {
    let tick = binance.last(candlestickData);
    const symbol = candlestickData.s;
    const close = candlestickData[tick].c;
    console.log(symbol+": "+close);
  });
});