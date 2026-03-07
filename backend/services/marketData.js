import axios from "axios";

const API_KEY = process.env.CMC_API_KEY;

export async function getMarketData(symbol){

  const base = symbol.replace("USDT","");

  const res = await axios.get(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
    {
      params:{ symbol: base },
      headers:{
        "X-CMC_PRO_API_KEY": API_KEY
      }
    }
  );

  const coin = res.data.data[base].quote.USD;

  return {
    price: coin.price,
    change24h: coin.percent_change_24h,
    volume: coin.volume_24h
  };
}