import { Router } from "express";
import {
getPremiumIndex,
getOpenInterest,
getTicker24h,
getLiquidationOrders,
getOrderBookDepth,
getKlines
} from "../services/binanceService.js";

import { getIndicatorSummary } from "../analytics/indicatorsService.js";
import { getOIPercentChange, interpretOIAndPrice, recordOpenInterest } from "../analytics/openInterestService.js";
import { clusterLiquidations } from "../analytics/liquidationClusterService.js";
import { detectLiquidityZones } from "../analytics/liquidityMapService.js";
import { analyzeOrderBook } from "../analytics/orderBookService.js";

const router = Router();


// ====================================
// MAIN ANALYSIS ENGINE
// ====================================

async function runAnalysis(pair){

const ticker = await getTicker24h(pair);

const lastPrice = Number(ticker?.lastPrice || 0);
const priceChangePercent = Number(ticker?.priceChangePercent || 0);
const volume = Number(ticker?.quoteVolume || 0);

const high24h = Number(ticker?.highPrice || lastPrice);
const low24h = Number(ticker?.lowPrice || lastPrice);

const spread =
high24h && low24h
? ((high24h - low24h) / lastPrice) * 100
: 0;

const oi = await getOpenInterest(pair);
const klines = await getKlines(pair,"15m",120);
const depth = await getOrderBookDepth(pair);
const liqOrders = await getLiquidationOrders(pair);
const funding = await getPremiumIndex(pair);


// FUNDING SENTIMENT

const fundingRate =
funding?.lastFundingRate
? Number(funding.lastFundingRate)*100
: 0;

let fundingSentiment="NEUTRAL";

if(fundingRate>0.02) fundingSentiment="OVERLONG";
if(fundingRate<-0.02) fundingSentiment="OVERSHORT";


// MARKET REGIME

let regime="RANGING";

if(Math.abs(priceChangePercent)>3) regime="VOLATILE";
if(priceChangePercent>2) regime="TRENDING_UP";
if(priceChangePercent<-2) regime="TRENDING_DOWN";


// OPEN INTEREST

let oiChangePct=0;
let oiInterpretation="neutral";

if(oi?.openInterest){

recordOpenInterest(pair,oi.openInterest);

oiChangePct=getOIPercentChange(pair,oi.openInterest)||0;

oiInterpretation=
interpretOIAndPrice(priceChangePercent,oiChangePct)||"neutral";

}


// LIQUIDATION HEATMAP

const clusters=
liqOrders
?clusterLiquidations(liqOrders,lastPrice)
:[];

let liquidationHeatmap=[];

if(clusters?.length){

liquidationHeatmap=
clusters
.sort((a,b)=>b.size-a.size)
.slice(0,6)
.map(c=>({

price:Number(c.price),
size:Math.round(c.size),
side:c.price>lastPrice?"ABOVE":"BELOW"

}));

}


// LIQUIDITY ZONES

const liquidityZones=
klines?.length
?detectLiquidityZones(klines,depth)
:{resistance:[],support:[]};


// SUPPORT / RESISTANCE

const resistance=
liquidityZones?.resistance?.slice(0,3).map((z,i)=>[
`R${i+1}`,Number(z.price)
])||[];

const support=
liquidityZones?.support?.slice(0,3).map((z,i)=>[
`S${i+1}`,Number(z.price)
])||[];


// ORDERBOOK

const orderBook=
depth
?analyzeOrderBook(depth.bids,depth.asks)
:null;


// WHALE ORDERS

let whaleOrders=[];

if(depth?.bids&&depth?.asks){

const threshold=500000;

const bids=depth.bids
.map(b=>{

const price=Number(b[0]);
const qty=Number(b[1]);
const value=price*qty;

return{price,value,side:"BUY"};

})
.filter(b=>b.value>threshold);

const asks=depth.asks
.map(a=>{

const price=Number(a[0]);
const qty=Number(a[1]);
const value=price*qty;

return{price,value,side:"SELL"};

})
.filter(a=>a.value>threshold);

whaleOrders=
[...bids,...asks]
.sort((a,b)=>b.value-a.value)
.slice(0,6)
.map(w=>({

price:w.price,
sizeUSD:Math.round(w.value),
side:w.side

}));

}


// ATR CALCULATION

let atr=0;

if(klines?.length>1){

let totalRange=0;

for(let i=1;i<klines.length;i++){

const high=Number(klines[i][2]);
const low=Number(klines[i][3]);

totalRange+=Math.abs(high-low);

}

atr=totalRange/klines.length;

}


// TARGETS

const bullTarget=lastPrice+atr*2;
const bearTarget=lastPrice-atr*2;

const extremeBull=lastPrice+atr*3.5;
const extremeBear=lastPrice-atr*3.5;


// SIGNAL ENGINE

let bullScore=0;
let bearScore=0;

if(priceChangePercent>0) bullScore++;
if(priceChangePercent<0) bearScore++;

if(oiChangePct>0) bullScore++;
if(oiChangePct<0) bearScore++;

if(orderBook?.pressure==="BULLISH") bullScore++;
if(orderBook?.pressure==="BEARISH") bearScore++;

if(fundingSentiment==="OVERSHORT") bullScore++;
if(fundingSentiment==="OVERLONG") bearScore++;

let bias="neutral";

if(bullScore>bearScore) bias="bullish";
if(bearScore>bullScore) bias="bearish";

const confidencePct=
Math.min(100,
Math.round((Math.max(bullScore,bearScore)/6)*100)
);


// ====================================
// AI TRADE SIGNAL GENERATOR
// ====================================

let tradeSignal=null;

if(confidencePct>60){

if(bias==="bullish"){

tradeSignal={
side:"LONG",
entry:lastPrice,
target:Number(bullTarget.toFixed(2)),
stop:Number((lastPrice-atr*1.5).toFixed(2)),
confidence:confidencePct
};

}

if(bias==="bearish"){

tradeSignal={
side:"SHORT",
entry:lastPrice,
target:Number(bearTarget.toFixed(2)),
stop:Number((lastPrice+atr*1.5).toFixed(2)),
confidence:confidencePct
};

}

}


return{

symbol:pair,

currentPrice:Number(lastPrice.toFixed(2)),
priceChange24h:Number(priceChangePercent.toFixed(2)),
volume24h:Math.round(volume),

high24h,
low24h,
spread:spread.toFixed(2),

atr:Number(atr.toFixed(2)),

bullTarget:Number(bullTarget.toFixed(2)),
bearTarget:Number(bearTarget.toFixed(2)),

extremeBull:Number(extremeBull.toFixed(2)),
extremeBear:Number(extremeBear.toFixed(2)),

resistance,
support,

fundingRate:Number(fundingRate.toFixed(4)),
fundingSentiment,

openInterest:oi?.openInterest||0,
openInterestChangePct:oiChangePct,
oiInterpretation,

liquidationHeatmap,

whaleOrders,

regime,

bullScore,
bearScore,
bullPct:bullScore*20,

bias,

confidencePct,

tradeSignal,

timestamp:new Date().toUTCString()

};

}


// SINGLE TOKEN ANALYSIS

router.get("/analysis/:symbol", async(req,res)=>{

try{

let symbol=req.params.symbol.toUpperCase();

if(!symbol.endsWith("USDT")) symbol+="USDT";

const data=await runAnalysis(symbol);

res.json(data);

}

catch(e){

res.status(500).json({error:e.message});

}

});


// MULTI TOKEN SCANNER

router.get("/scanner", async(req,res)=>{

try{

const tokens=[
"BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT",
"XRPUSDT","DOGEUSDT","AVAXUSDT","ADAUSDT",
"LINKUSDT","ARBUSDT"
];

const results=[];

for(const t of tokens){

const r=await runAnalysis(t);

results.push(r);

}

const bullish=
results
.filter(r=>r.bias==="bullish")
.sort((a,b)=>b.confidencePct-a.confidencePct)
.slice(0,5);

const bearish=
results
.filter(r=>r.bias==="bearish")
.sort((a,b)=>b.confidencePct-a.confidencePct)
.slice(0,5);

res.json({

topBullish:bullish,
topBearish:bearish,
scanned:results.length

});

}

catch(e){

res.status(500).json({error:e.message});

}

});


export default router;