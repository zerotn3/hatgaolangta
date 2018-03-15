const binance = require('node-binance-api');
const listcoinBNB = require('./listcoinbinance');
const BB = require('technicalindicators').BollingerBands;
const R = require('ramda');
const fs = require('fs');
const moment = require('moment');
//
// // // Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
// binance.prevDay(false, (error, prevDay) => {
//   let markets = [];
//   for ( let obj of prevDay ) {
//     let symbol = obj.symbol;
//     console.log(symbol+" volume:"+obj.volume+" change: "+obj.priceChangePercent+"%");
//     markets.push(symbol);
//   }
//   binance.websockets.candlesticks(markets, '1m', (candlestickData) => {
//     let tick = binance.last(candlestickData);
//     //const symbol = candlestickData.s;
//     //const close = candlestickData[tick].c;
//     //console.log(symbol+": "+close);
//
//     let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlestickData;
//     let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
//     console.log(symbol+" "+interval+" candlestick update");
//     console.log("open: "+open);
//     console.log("high: "+high);
//     console.log("low: "+low);
//     console.log("close: "+close);
//     console.log("volume: "+volume);
//     console.log("isFinal: "+isFinal);
//   });
// // });
//
// binance.websockets.chart("BNBBTC", "1m", (symbol, interval, chart) => {
//
//   //console.log(d);
//   let tick = binance.last(chart);
//   let d = moment(Number(tick)).toString();
//   const last = chart[tick].close;
//   console.log(d);
//   // Optionally convert 'chart' object to array:
//    let ohlc = binance.ohlc(chart);
//    console.log(symbol, ohlc);
//   console.log(symbol+" last price: "+last)
// });


binance.candlesticks("BNBBTC", "15m", (error, ticks, symbol) => {
  console.log("candlesticks()", ticks);
  let last_tick = ticks[ticks.length - 1];
  let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
  console.log(symbol+" last close: "+close);
}, {limit: 100, endTime: 1514764800000});