const binance = require('node-binance-api');
const listcoinBNB = require('./listcoinbinance');
const BB = require('technicalindicators').BollingerBands;
const R = require('ramda');

const fs = require('fs');


//console.log(listcoinBNB);
binance.prices((error, ticker) => {
  //console.log("prices()", ticker);
  //console.log("Price of BTC: ", ticker.BTCUSDT);
});
// Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
binance.websockets.chart("BNBBTC", "30m", (symbol, interval, chart) => {


  let keys = Object.keys(chart);
  let love6st = R.takeLast(50, keys);

  let closePrice = [];
  love6st.forEach(function (entry) {
    closePrice.push(Number(chart[entry].close));
  });


  //check nen xanh do
  let love3st = R.takeLast(3, keys);
  let redblueArr = [];
  love3st.forEach(function (entry) {
    redblueArr.push(Number(chart[entry].close));
  });

  let tick = binance.last(chart);
  const last = chart[tick].close;
  const volume = chart[tick].volume;

  if(volume > 10){
    let bb26 = getBB(6, 2, closePrice);
    console.log('Checking ......');
    if(bb26 === last) {
      console.log(bb26 + last);
    }
  }


  //console.log(chart);
  // Optionally convert 'chart' object to array:
  let ohlc = binance.ohlc(chart);
  // console.log(symbol, ohlc);
  //console.log(symbol+" last price: "+last);

  fs.appendFile('server.log', ohlc + '\n' + symbol + " last price: " + last + "\n", function (err) {
    if (err) return console.log(err);
    //console.log('Appended!');
  });
});


function getBB(period, stdDev, values) {
  let rs;
  let input = {
    period: period,
    values: values,
    stdDev: stdDev

  }
  rs = R.last(BB.calculate(input));
  return parseFloat(rs.lower).toFixed(8);
}

// function checkCandle(arr){
//   arr.forEach(function (coin) {
//     if()
//   });
// }








