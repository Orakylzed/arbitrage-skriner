const BINANCE_URL = 'https://api1.binance.com/api/v3/ticker/24hr';

const HUOBI_URL = 'https://api.huobi.pro/market/tickers';

const MEXC_URL = 'https://www.mexc.com/open/api/v2/market/ticker';
const MEXC_URLW = 'https://www.mexc.com/open/api/v2/market/coin/list';

const GATE_URL = 'https://data.gateapi.io/api2/1/tickers';
const GATE_URLW = 'https://data.gateapi.io/api2/1/coininfo';

const OKX_URL = 'https://www.okx.com/api/v5/market/tickers?instType=SPOT';

const BITMART_URL = 'https://api-cloud.bitmart.com/spot/v1/ticker';
const BITMART_URLW = 'https://api-cloud.bitmart.com/spot/v1/currencies';






const getDataBtn = document.querySelector('#getData');
const rootElem = document.querySelector('.root');
const infoWrapper = document.querySelector('.info-wrapper');
const priceCalkElem = document.querySelector('.priceForCalk');
const profitCalkElem = document.querySelector('.rofitForCalk');
const calkResultElem = document.querySelector('.calkResult');
const feeInCoinElem = document.querySelector('#fee-in-coin');
const calkMinButton = document.querySelector('#calkMin');

let BINANCE_DATA = null;
let HUOBI_DATA = null;
let MEXC_DATA = null;
let MEXC_DATA_WITHDRAW = null;
let GATE_DATA = null;
let GATE_DATA_WITHDRAW = null;
let OKX_DATA = null;
let BITMART_DATA = null;
let BITMART_DATA_WITHDRAW = null;

let tokenList = [];
let positionList = [];
let askPrices = [];
let bidPrices = [];
let finalList = [];

let priceForCalc = 0;
let profitForCalc = 0;
let feeInCoin = 0;

getDataBtn.addEventListener('click', () => {
    getData();
    rootElem.innerHTML = '';
    setTimeout(start, 7000)
});

infoWrapper.addEventListener('click', (e) => {
    if (e.target.classList.contains('info-wrapper')) {
        e.target.classList.add('hide');
    }
});

rootElem.addEventListener('click', (e) => {
    if (e.target.classList.contains('info')) {
        infoWrapper.classList.remove('hide');
        
    }
});

rootElem.addEventListener('click', (e) => {
    if (e.target.classList.contains('sel')) {
        let arr = document.querySelectorAll('.item');
        for (el of arr) {
            el.classList.remove('selected');
        }
        e.target.parentElement.parentElement.parentElement.classList.add('selected');
        priceForCalc = +e.target.getAttribute("data-price");
        profitForCalc = +e.target.getAttribute("data-profit");
        priceCalkElem.innerHTML = priceForCalc;
        profitCalkElem.innerHTML = profitForCalc;       
    }
});

calkMinButton.addEventListener('click', () => {
    feeInCoin = +feeInCoinElem.value;
    let minVal = (feeInCoin * priceForCalc * 100) / profitForCalc;
    calkResultElem.innerHTML = `fee in usdt: ${feeInCoin * priceForCalc}     min amount: ${minVal}`;
});

function sendRequest(url) {
    return new Promise( (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response);
            } else {
                resolve(xhr.response);
            }
        }
        xhr.send();
    })
}

function getData() {
    sendRequest(BINANCE_URL).then( data => {BINANCE_DATA = dataAnalis(data);} )
    .catch( (err) => console.log(err) );
sendRequest(HUOBI_URL).then( data => {HUOBI_DATA = dataAnalis(data.data);} )
    .catch( (err) => console.log(err) );
sendRequest(MEXC_URL).then( data => {MEXC_DATA = dataAnalis(data.data);} )
    .catch( (err) => console.log(err) );
sendRequest(MEXC_URLW).then( data => {MEXC_DATA_WITHDRAW = mexcDataWithAnalise(data.data);} )
    .catch( (err) => console.log(err) );
sendRequest(GATE_URL).then( data => {GATE_DATA = gateDataNormalise(data);} )
    .catch( (err) => console.log(err) );
sendRequest(GATE_URLW).then( data => {GATE_DATA_WITHDRAW = gateDataWithAnalise(data.coins);} )
    .catch( (err) => console.log(err) );
sendRequest(OKX_URL).then( data => {OKX_DATA = okxDataNormalise(data.data); } )
    .catch( (err) => console.log(err) );
sendRequest(BITMART_URL).then( data => {BITMART_DATA = bitmartDataNormalise(data.data.tickers);} )
    .catch( (err) => console.log(err) );
sendRequest(BITMART_URLW).then( data => {BITMART_DATA_WITHDRAW = bitmartDataWithAnalise(data.data.currencies);} )
    .catch( (err) => console.log(err) );
}



function gateDataNormalise(data) {
    
    let obj = new Object();
    let arr = Object.keys(data);
    
    arr.sort((a, b) => a > b ? 1 : -1);
    for (let i = arr.length - 1; i > -1; i--) {
        if (!arr[i].includes('usdt') || arr[i].includes('3l') || arr[i].includes('3s') || arr[i].includes('5t') || arr[i].includes('5l') || arr[i].includes('5s')) {
            arr.splice(i, 1);
        }
    }
    
    for (let i = arr.length - 1; i > -1; i--) {
        if (data[arr[i]].lowestAsk > 0 && data[arr[i]].highestBid > 0) {
            
            obj[arr[i].toUpperCase().replace('USDT', '').replace('_', '')] = {
                ask: data[arr[i]].lowestAsk,
                bid: data[arr[i]].highestBid
            };
            tokenList.push(arr[i].toUpperCase().replace('USDT', '').replace('_', ''))
        }
    }
    
    return obj;
}

function gateDataWithAnalise(data) {
    let obj = new Object();

    for (let i = 0; i < data.length; i++) {
        let coin = Object.keys(data[i])[0];
        obj[coin] = {
            canDep: !data[i][coin].deposit_disabled,
            canWith: !data[i][coin].withdraw_disabled
        }
    }

    return obj;
}

function okxDataNormalise(data) {
    let obj = new Object();

    for (let i = data.length - 1; i > -1; i--) {
        if (!data[i].instId.includes('USDT')) {
            data.splice(i, 1);
        }
    }

    for (let i = 0; i < data.length; i++) {
        obj[data[i].instId.replace('USDT', '').replace('-', '')] = {
            ask: data[i].askPx,
            bid: data[i].bidPx
        }
        tokenList.push(data[i].instId.replace('USDT', '').replace('-', ''))
    }

    return obj;
}

function bitmartDataNormalise(data) {
    
    let obj = new Object();

    for (let i = data.length - 1; i > -1; i--) {
        if (!data[i].symbol.includes('USDT')) {
            data.splice(i, 1);
        }
    }

    for (let i = 0; i < data.length; i++) {
        let coin = data[i].symbol.replace('USDT', '').replace('_', '');
        obj[coin] = {
            ask: data[i].best_ask,
            bid: data[i].best_bid
        }
        tokenList.push(coin);
    }

    
    return obj;
}

function bitmartDataWithAnalise(data) {
    let obj = new Object();

    for (let i = 0; i < data.length; i++) {
        obj[data[i].id] = {
            canDep: data[i].deposit_enabled,
            canWith: data[i].withdraw_enabled
        };
    }

    return obj;
}

function mexcDataWithAnalise(data) {
    let obj = new Object();

    for (let i = 0; i < data.length; i++) {
        obj[data[i].currency] = {
            canDep: data[i].coins[0].is_deposit_enabled,
            canWith: data[i].coins[0].is_withdraw_enabled
        };
    }

    return obj;
}

function dataAnalis(pairs) {

    let prices = new Object();

    for (let i = pairs.length - 1; i >= 0; i--) {
        if (!pairs[i].symbol.toLowerCase().includes('usdt') || pairs[i].symbol.toLowerCase().includes('down') || pairs[i].symbol.toLowerCase().includes('up') || pairs[i].symbol.toLowerCase().includes('nav') || pairs[i].symbol.toLowerCase().includes('3s') || pairs[i].symbol.toLowerCase().includes('3l') || pairs[i].symbol.toLowerCase().includes('2l') || pairs[i].symbol.toLowerCase().includes('2s') || pairs[i].symbol.toLowerCase().includes('4l') || pairs[i].symbol.toLowerCase().includes('4s')) {
            pairs.splice(i, 1);
        }
    }

    for (let i = pairs.length - 1; i >= 0; i--) {
        pairs[i].symbol = pairs[i].symbol.replace('usdt', '').replace('USDT', '').replace('_', '');
    }

    pairs.sort((a, b) => a.symbol > b.symbol ? 1 : -1);
    
    for (let i = 0; i < pairs.length - 1; i++) {
        tokenList.push(pairs[i].symbol.toUpperCase().replace('USDT', '').replace('_', ''));
    }
    
    for (let i = 0; i < pairs.length; i++) {
        prices[pairs[i].symbol.toUpperCase()] = {
            ask: pairs[i].askPrice || pairs[i].ask,
            bid: pairs[i].bidPrice || pairs[i].bid
        };        
    }

    return prices;
}

function tokenAnalis() {
    tokenList.sort((a, b) => a > b ? 1 : -1);
    tokenList = tokenList.filter((it, index) => index === tokenList.indexOf(it = it.trim()));
}

function askPriceAnalise()  {

    let arr = new Object();
    
    for (let i = 0; i < tokenList.length; i++) {
        arr[tokenList[i]] = {
            BINANCE: BINANCE_DATA[tokenList[i]] ? +BINANCE_DATA[tokenList[i]].ask : 99999,
            HUOBI: HUOBI_DATA[tokenList[i]] ? +HUOBI_DATA[tokenList[i]].ask : 99999,
            MEXC: MEXC_DATA[tokenList[i]] ? +MEXC_DATA[tokenList[i]].ask : 99999,
            GATE: GATE_DATA[tokenList[i]] ? +GATE_DATA[tokenList[i]].ask : 99999,
            OKX: OKX_DATA[tokenList[i]] ? +OKX_DATA[tokenList[i]].ask : 99999,
            BITMART: BITMART_DATA[tokenList[i]] ? +BITMART_DATA[tokenList[i]].ask : 99999
        }
    }  

    for (let i = 0; i < tokenList.length; i++) {
        let coin = tokenList[i];
        let list = arr[coin];
        let min = {
            BINANCE: list.BINANCE
        };

        if (min[Object.keys(min)[0]] > list.HUOBI) {
            min = {
                HUOBI: list.HUOBI
            }
        }
        if (min[Object.keys(min)[0]] > list.MEXC) {
            min = {
                MEXC: list.MEXC
            }
        }
        if (min[Object.keys(min)[0]] > list.GATE) {
            min = {
                GATE: list.GATE
            }
        }
        if (min[Object.keys(min)[0]] > list.OKX) {
            min = {
                OKX: list.OKX
            }
        }
        if (min[Object.keys(min)[0]] > list.BITMART) {
            min = {
                BITMART: list.BITMART
            }
        }

        askPrices[coin] = min;
    }
}

function bidPriceAnalise()  {
    
    let arr = new Object();

    for (let i = 0; i < tokenList.length; i++) {
        arr[tokenList[i]] = {
            BINANCE: BINANCE_DATA[tokenList[i]] ? +BINANCE_DATA[tokenList[i]].bid : 0,
            HUOBI: HUOBI_DATA[tokenList[i]] ? +HUOBI_DATA[tokenList[i]].bid : 0,
            MEXC: MEXC_DATA[tokenList[i]] ? +MEXC_DATA[tokenList[i]].bid : 0,
            GATE: GATE_DATA[tokenList[i]] ? +GATE_DATA[tokenList[i]].bid : 0,
            OKX: OKX_DATA[tokenList[i]] ? +OKX_DATA[tokenList[i]].bid : 0,
            BITMART: BITMART_DATA[tokenList[i]] ? +BITMART_DATA[tokenList[i]].bid : 0
        }
    }  

    for (let i = 0; i < tokenList.length; i++) {
        let coin = tokenList[i];
        let list = arr[coin];
        let max = {
            BINANCE: list.BINANCE
        };

        if (max[Object.keys(max)[0]] < list.HUOBI) {
            max = {
                HUOBI: list.HUOBI
            }
        }
        if (max[Object.keys(max)[0]] < list.MEXC) {
            max = {
                MEXC: list.MEXC
            }
        }
        if (max[Object.keys(max)[0]] < list.GATE) {
            max = {
                GATE: list.GATE
            }
        }
        if (max[Object.keys(max)[0]] < list.OKX) {
            max = {
                OKX: list.OKX
            }
        }
        if (max[Object.keys(max)[0]] < list.BITMART) {
            max = {
                BITMART: list.BITMART
            }
        }

        bidPrices[coin] = max;
    }        
}

function finalListAnalise() {
    finalList = [];

    for (let i = 0; i < tokenList.length; i++) {

        let buyPrice = askPrices[tokenList[i]][Object.keys(askPrices[tokenList[i]])[0]];
        let sellPrice = bidPrices[tokenList[i]][Object.keys(bidPrices[tokenList[i]])[0]]

        finalList.push({
            [tokenList[i]]: {
                buy: askPrices[tokenList[i]],
                sell: bidPrices[tokenList[i]],
                profit: (sellPrice / buyPrice * 100 - 100) * 0.998
            }
        });

    }

    for (let i = finalList.length - 1; i>-1; i--) {
        let val = finalList[i][Object.keys(finalList[i])[0]].profit;
        if (val < 1 || val > 20) {
            finalList.splice(i, 1);
        } else if (finalList[i][Object.keys(finalList[i])[0]].buy.BINANCE === 0 || finalList[i][Object.keys(finalList[i])[0]].sell.BINANCE === 0) {
            finalList.splice(i, 1);
        }
    }

    for (let i = finalList.length - 1; i > -1; i--) {
        
        let coin = Object.keys(finalList[i])[0];
        let exBuy = Object.keys(finalList[i][Object.keys(finalList[i])].buy)[0];
        let exSell = Object.keys(finalList[i][Object.keys(finalList[i])].sell)[0];

        if (exBuy == 'MEXC') {
            if (!MEXC_DATA_WITHDRAW[coin].canWith) {
                finalList.splice(i, 1); 
            }        
        } else if (exSell == 'MEXC') {
            if (!MEXC_DATA_WITHDRAW[coin].canDep) {
                finalList.splice(i, 1);
            } 
        }

        if (exBuy == 'GATE') {
            if (!GATE_DATA_WITHDRAW[coin].canWith) {
                finalList.splice(i, 1);   
            }      
        } else if (exSell == 'GATE') {
            if (!GATE_DATA_WITHDRAW[coin].canDep) {
                finalList.splice(i, 1);
            } 
        }

        if (exBuy == 'BITMART') {
            if (!BITMART_DATA_WITHDRAW[coin].canWith) {
                finalList.splice(i, 1);   
            }      
        } else if (exSell == 'BITMART') {
            if (!BITMART_DATA_WITHDRAW[coin].canDep) {
                finalList.splice(i, 1);
            } 
        }
    }

    finalList.sort((a, b) => a[Object.keys(a)].profit > b[Object.keys(b)].profit ? -1 : 1);    
}

function getLink(coin, ex) {

    if (ex == 'BITMART') {
        return `https://www.bitmart.com/trade/ru?layout=pro&symbol=${coin}_USDT`;
    }
    if (ex == 'GATE') {
        return `https://www.gate.io/uk/trade/${coin}_USDT`;
    }
    if (ex == 'MEXC') {
        return `https://www.mexc.com/exchange/${coin}_USDT`;
    }
    if (ex == 'HUOBI') {
        return `https://www.huobi.com/uk-ua/exchange/${coin.toLowerCase()}_usdt`;
    }
    if (ex == 'OKX') {
        return `https://www.okx.com/ua/trade-spot/${coin.toLowerCase()}-usdt`;
    }
    if (ex == 'BINANCE') {
        return `https://www.binance.com/uk-UA/trade/${coin}_USDT?theme=dark&type=spot`;
    }
}

function showResult() {
    rootElem.innerHTML = '';
    let res = ``;
    

    for (let i = 0; i < finalList.length; i++) {
        let coin = Object.keys(finalList[i])[0];
        let buyObj = finalList[i][Object.keys(finalList[i])[0]].buy;
        let buy = Object.keys(buyObj)[0];
        let buyPrice = buyObj[buy];
        let profit = String(finalList[i][Object.keys(finalList[i])[0]].profit).slice(0, 5);
        let sellObj = finalList[i][Object.keys(finalList[i])[0]].sell;
        let sell = Object.keys(sellObj)[0];
        let sellPrice = sellObj[sell];

        res += `
            <div class="item">
                <div class="coin-name">
                    <div class="control">
                        <div class="butt sel" data-price="${buyPrice}" data-profit="${profit}">sel</div>
                        <div  class="butt info">info</div>
                    </div>
                    <div class="name">${coin}</div>
                </div>
                <div class="coin-info">
                    <div class="buy">
                        <div class="exchange"><a target="_blank" class="buy" href="${getLink(coin, buy)}">${buy}</a></div>
                        <div class="price">${buyPrice}</div>
                    </div>
                    <div class="profit">${profit}%</div>
                    <div class="sell">
                        <div class="exchange"><a target="_blank" class="sell" href="${getLink(coin, sell)}">${sell}</a></div>
                        <div class="price">${sellPrice}</div>
                    </div>
                </div>
            </div>
        `;
    }

    rootElem.innerHTML = res;
}

function showPrices(coin) {
    let elem = document.querySelector('.info-tablet');
    elem.innerHTML = 'DONE';
    console.log(elem);
}



function start() {
    tokenAnalis();
    askPriceAnalise();
    bidPriceAnalise();
    finalListAnalise();
    showResult();

}