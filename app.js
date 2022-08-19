const BINANCE_URL = 'https://api1.binance.com/api/v3/ticker/24hr';
const HUOBI_URL = 'https://api.huobi.pro/market/tickers';
const MEXC_URL = 'https://www.mexc.com/open/api/v2/market/ticker';
const GATE_URL = 'https://data.gateapi.io/api2/1/tickers';
const OKX_URL = 'https://www.okx.com/api/v5/market/tickers?instType=SPOT';

//BYBIT
// const BYBIT_URL = 'https://api.bytick.com/spot/v1/symbols';


const getDataBtn = document.querySelector('#getData');
const calkDataBtn = document.querySelector('#calcData');

let BINANCE_DATA = null;
let HUOBI_DATA = null;
let MEXC_DATA = null;
let GATE_DATA = null;
let OKX_DATA = null;

let tokenList = [];
let positionList = [];
let askPrices = [];
let bidPrices = [];
let finalList = [];

getDataBtn.addEventListener('click', () => {
    getData();
});

calkDataBtn.addEventListener('click', () => {
    start();
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
sendRequest(GATE_URL).then( data => {GATE_DATA = gateDataNormalise(data);} )
    .catch( (err) => console.log(err) );
sendRequest(OKX_URL).then( data => {OKX_DATA = okxDataNormalise(data.data); } )
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
            OKX: OKX_DATA[tokenList[i]] ? +OKX_DATA[tokenList[i]].ask : 99999
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
            GATE: GATE_DATA[tokenList[i]] ? +GATE_DATA[tokenList[i]].ask : 0,
            OKX: OKX_DATA[tokenList[i]] ? +OKX_DATA[tokenList[i]].ask : 0
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
                profit: sellPrice / buyPrice * 100 - 100
            }
        });

    }

    for (let i = finalList.length - 1; i>-1; i--) {
        let val = finalList[i][Object.keys(finalList[i])[0]].profit;
        if (val < 1 || val > 100) {
            finalList.splice(i, 1);
        } else if (finalList[i][Object.keys(finalList[i])[0]].buy.BINANCE === 0 || finalList[i][Object.keys(finalList[i])[0]].sell.BINANCE === 0) {
            finalList.splice(i, 1);
        }
    }
}






function start() {
    tokenAnalis();
    askPriceAnalise();
    bidPriceAnalise();
    finalListAnalise();

    
    console.log(finalList);
}

