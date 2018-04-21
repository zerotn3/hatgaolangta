const bittrex = require('node-bittrex-api');
const {forEach} = require('p-iteration');
const _ = require('lodash');
const RSI = require('technicalindicators').RSI;
const BB = require('technicalindicators').BollingerBands;
const EMA = require('technicalindicators').EMA
const TelegramBot = require('node-telegram-bot-api');
const ListCoinBittrex = require('../models/ListCoinBittrex');
const moment = require('moment');

async function getListCoinBittrex() {
  console.log(`Bắt đầu check list coin trên bittrex .....`);
  Promise.all([getListDataBittrex()])
    .then((data) => {
        for (let i in data[0]) {
          let marketName = data[0][i].MarketName;
          let p1 = new Promise((resolve, reject) => {
            ListCoinBittrex.findOne({marketNn: marketName}, function (err, marketNn) {
              if (!err) {
                if (!marketNn) {
                  let listCoinBittrex = new ListCoinBittrex();
                  listCoinBittrex.marketNn = marketName;

                  listCoinBittrex.save(function (err) {
                    if (!err) {
                      console.log(`Coin mới vừa cập nhật : ${marketName}`);
                    }
                    else {
                      console.log(`Có lỗi hệ thống trong quá trình kiểm tra list coin`);
                    }
                  });
                  resolve(marketNn);
                }
              } else {
                reject(err);
                console.log(`Có lỗi hệ thống, liên hệ Admin`);
              }
            });
          });
          Promise.all([p1])
            .then((data) => {
              //console.log(`aloha ${data}`);
            })
            .catch((err) => {
              console.log(`Có lỗi hệ thống ${err}`)
            });
        }
      }
    )
    .catch((err) => {
      console.log(`IssueTool : ${err}`);
    });


};

const getListDataBittrex = () => {
  return new Promise((resolve, reject) =>
    bittrex.getmarketsummaries((data, error) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve(data.result);
    }))
};


const getListCoinFromBD = () => {
  return new Promise((resolve, reject) => {
    ListCoinBittrex.find({}, (err, val) => {
      if (!err) {
        resolve(val);
      } else {
        reject(err);
      }
    });
  });
}
const funcCheckCoinEMA = () => {
  getListCoinFromBD()
    .then((data) => {
        data.forEach((coinNm) => {
          setTimeout(() => {
            Promise.all([funGetEMA(coinNm.marketNn)])
              .then((data) => {
                let Sval = data[0];
                let Lval = data[1];
                let Sval1 = data[2];
                let Lval1 = data[3];
                let ClosePrice = data[4];
                let ClosePrice1 = data[5];
                //let timenow = new moment().format("HH:mm");
                //check up trend
                if ((Sval > Lval) && (Sval1 < Lval1)) {
                  console.log(`Mua kìa ba ơi : 
                              Tên Coin : ${coinNm.marketNn}
                              Giá Vào: ${ClosePrice}
                              Thời gian: 
                              `)
                }
               // console.log(data);
              })
              .catch((err) => {
                console.log(`IssueTool : ${err}`);
              });
          }, 5000)
        })
      }
    );
}

const funGetEMA = async (marketNm) => {
  return new Promise((resolve, reject) => {
    bittrex.getticks({
      marketName: marketNm,
      tickInterval: 'hour'
    }, (data, err) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      let coinArr = data.result;
      let listclosePrice = _.map(coinArr, 'C');
      let lastClosePrice = _.last(listclosePrice);
          coinArr.pop();
      let listcloseLastPrice = _.map(coinArr, 'C');
      let lastClosePrice1 = _.last(listcloseLastPrice);

      let emaarr = [];
      //the last candle
      let emaVal10 = _.last(EMA.calculate({period: 10, values: listclosePrice}));
      let emaVal5 = _.last(EMA.calculate({period: 5, values: listclosePrice}));

      //the last candle - 1
      let emaVal10_1 = _.last(EMA.calculate({period: 10, values: listcloseLastPrice}));
      let emaVal5_1 = _.last(EMA.calculate({period: 5, values: listcloseLastPrice}));

      emaarr.push(emaVal5);
      emaarr.push(emaVal10);
      emaarr.push(emaVal5_1);
      emaarr.push(emaVal10_1);
      emaarr.push(lastClosePrice);
      emaarr.push(lastClosePrice1);

      resolve(emaarr);
    })
  })
};

const bittrexSignal = {

  getListCoinBittrex: getListCoinBittrex,
  funcCheckCoinEMA: funcCheckCoinEMA

};

module.exports = bittrexSignal;