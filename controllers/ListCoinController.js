const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const ListCoinBittrex = require('../models/ListCoinBittrex');

const url = require('url');
const redirect_after_login = "/dashboard";
const userHelper = require('../helpers/helper').user;
const Config = require('../models/Config');
const constants = require('../config/constants.json');
const UL = constants.UPGRADE_LEVEL;
const moment = require("moment");
const request = require('request-promise');
const UPGRADE_LEVEL = constants.UPGRADE_LEVEL;
const helper = require('../helpers/helper');
const _ = require('lodash');
const WalletTransaction = require('../models/WalletTransaction');
const RequestBtc = require('../models/RequestBtc');

const bittrex = require('node-bittrex-api');
const getStandardDeviation = require('get-standard-deviation');
const BB = require('technicalindicators').BollingerBands;


// let countrun = 0;
// let minutes = 1, the_interval = minutes * 60 * 100;
// setInterval(function () {
//   getBB26();
//   getListCoin();
//   countrun = countrun + 1;
//   console.log("==========Chạy được   " + countrun + "   lần=============")
// }, the_interval);


function getBB(period, stdDev, values) {
  let rs
  let input = {
    period: period,
    values: values,
    stdDev: stdDev

  }
  rs = BB.calculate(input);
  return rs;
}


function checkBetweenTwoBB(marketNm) {
  bittrex.getcandles({
    marketName: marketNm,
    tickInterval: 'thirtyMin'
  }, function (data, err) {
    if (err) {
      return console.error(err);
    }
    let coinArr = data.result;
    let last6candle = coinArr.slice((coinArr.length - 6), coinArr.length)
    let last20candle = coinArr.slice((coinArr.length - 20), coinArr.length)
    let bb62 = getBB(6, 2, last6candle);
    let bb202 = getBB(20, 2, last20candle);


  });
}

function getListCoin() {
  let promise;
  //delete list coin before delete
  deleteListCoinBeforeScan();


  bittrex.getmarketsummaries(function (data, err) {
    if (err) {
      return console.error(err);
    }
    //Chỉ get cặp BTC va volume > 500
    data.result = _.filter(
      data.result, u => u.MarketName.toString().indexOf('BTC-') > -1
        && u.BaseVolume > 500
        && _spread(u.Last, u.Ask, u.Bid) > 0.2
        && _checkTrend(u.MarketName) != 'up'
        && _checkCandle(u.MarketName) != '2red'
    );

    for (let i in data.result) {
      let coinRes = data.result[i];
      //console.log(data.result[i].MarketName);
      const listcoin = new ListCoinBittrex({
        marketNn: coinRes.MarketName,
        bvolume: coinRes.BaseVolume,
        spread: _spread(coinRes.Last, coinRes.Ask, coinRes.Bid),
        candle: _checkCandle(coinRes.MarketName),
        trend: _checkTrend(coinRes.MarketName),

        // bid: coinRes,
        // highVl: coinRes,
        // lowVl: coinRes,
        // lastVl: coinRes,
        // openBuyOrder: coinRes,
        // openSellOrder: Number,
        // timeMarket: String
      });

      listcoin.save(function (error) {
        //console.log("List coin has been saved!");
        if (error) {
          console.error(error);
        }
      });
      promise = "OK";
    }
  });
  return promise;
}

function deleteListCoinBeforeScan() {

  ListCoinBittrex.remove({}, (err) => {
    if (err) {
      return next(err);
    }
  });
}

function _spread(bittrexlast, bittrexask, bittrexbid) {
  return (100 / bittrexlast) * (bittrexask - bittrexbid);
}

function _checkTrend(marketNm) {
  let count_up = 0;
  let count_down = 0;
  setTimeout(function () {
    bittrex.getcandles({
      marketName: marketNm,
      tickInterval: 'thirtyMin'
    }, function (data, err) {
      if (err) {
        return console.error(err);
      }

      let coinArr = data.result;
      let newArrCoin = coinArr.slice((coinArr.length - 20), coinArr.length);

      newArrCoin.forEach(function (price) {
        {
          if (price.C > price.O) {
            count_up = count_up + 1;
          }
          if (price.C < price.O) {
            count_down = count_down + 1;
          }
        }
      });
    })
  }, 500);

  if (count_up > count_down) {
    return "up";
  } else if (count_up < count_down) {
    return "down";
  } else {
    return "sideway";
  }
}


function _checkCandle(marketNm) {

  //let CC = setTimeout(function () {
  let countred = 0;
  bittrex.getcandles({
    marketName: marketNm,
    tickInterval: 'thirtyMin'
  }, function (data, err) {
    if (err) {
      return console.error(err);
    }
    let coinArr = data.result;
    let last3candle = coinArr.slice((coinArr.length - 4), coinArr.length - 1);
    last3candle.forEach(function (price) {
      {
        if (price.C < price.O) {
          countred = countred + 1;
        }
      }
    });
    //return countred;
  });
  //}, 500);
  //console.log(countred);
  if (countred === 2) {
    return "2red";
  } else {
    return "1red";
  }
}

/**
 *
 * @param req
 * @param res
 */
exports.getReqWithdrawnList = (req, res) => {

  let p1 = new Promise((resolve, reject) => {
    ListCoinBittrex.find({}, (err, listCoin) => {
      if (err) {
        reject(err);
      } else {
        let listP1 = [];
        listCoin.forEach(function (scoin) {

          let coinNm = scoin._doc.marketNn;
          let timeenterPrice = scoin._doc.lastTime;
          let enterPrice = scoin._doc.enterPrice;
          let perWL = 0;
          let winLosePrice = 0;
          binance.candlesticks("BNBBTC", "15m", (error, ticks, symbol) => {
            console.log("candlesticks()", ticks);
            ticks.forEach(item => {
              if (timeenterPrice <= item[4]) {
                winLosePrice = item[4];
              }
            });

            let last_tick = ticks[ticks.length - 1];
            let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
            if(winLosePrice === 0){
              winLosePrice = close;
            }
            perWL = (winLosePrice - enterPrice)/enterPrice*100;
          }, {startTime: timeenterPrice, endTime: timeenterPrice + 4500000}); // check 5 candle later

          const objLst = {
            marketNm: coinNm,
            enterPrice: enterPrice,
            timeenterPrice: moment(Number(timeenterPrice)).toString(),
            perWL: perWL
          };
          listP1.push(objLst);
        });
        resolve(listP1);
      }
    });
  });

  Promise.all([p1])
    .then((data) => {
      res.render('account/listCoin', {
        title: 'List Coin',
        listCoin: data[0],
      });
    })
    .catch((err) => {
      return next(err);
    });
};

const getCoinToBTC = coin =>
  new Promise((resolve, reject) =>
    bittrex.sendCustomRequest(`https://bittrex.com/api/v1.1/public/getticker?market=BTC-${coin}`, ({result: {Last: value}}, err) => (
      err === null
        ? resolve(value)
        : reject(err)
    )));

