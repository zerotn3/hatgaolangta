const binance = require('node-binance-api');
const listcoinBNB = require('./listcoinbinance');
const BB = require('technicalindicators').BollingerBands;
const R = require('ramda');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');


const token = '472833515:AAGXIRPigpyRKgO1NfLCPXBJ3R-5twUKBNw';
//
//
const bot = new TelegramBot(token, {polling: true})

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  bot.sendMessage(chatId, resp);
});
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
  if (volume > 10) {
    let bb26 = getBB(6, 2, closePrice);
    if (bb26 === last) {
      bot.sendMessage('218238495', `Market Name: BNBBTC
                                    Giá tại BB26: ${bb26}
                                    Giá Last: ${last}`);
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

function checkCandle(arr) {
  if ((arr[0].C < arr[0].O) && (arr[1].C < arr[1].O)) {
    return false;
  }
  if ((arr[1].C < arr[1].O) && (arr[2].C < arr[2].O)) {
    return false;
  }
  if ((arr[0].C < arr[0].O) && (arr[1].C < arr[1].O) && (arr[2].C < arr[2].O)) {
    return false;
  }
  return true;
}











