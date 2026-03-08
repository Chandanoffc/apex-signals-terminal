"use client";

import { useState } from "react";

export default function Page() {

  const [symbol,setSymbol] = useState("BTC");
  const [data,setData] = useState(null);
  const [error,setError] = useState(null);
  const [loading,setLoading] = useState(false);

  async function analyse(){

    setError(null);
    setLoading(true);
    setData(null);

    try{

      const sym = symbol.trim().toUpperCase();

      const response = await fetch(
        `https://apex-signals-terminal.onrender.com/api/analyze/${sym}`,
        { cache: "no-store" }
      );

      const text = await response.text();

      // Prevent JSON crash if HTML returned
      if(text.startsWith("<")){
        throw new Error("API returned HTML instead of JSON");
      }

      const json = JSON.parse(text);

      setData(json);

    }catch(err){

      console.error(err);
      setError(err.message);

    }

    setLoading(false);
  }

  return (

    <div style={{
      padding:40,
      background:"#020617",
      minHeight:"100vh",
      color:"#00ff88",
      fontFamily:"monospace"
    }}>

      <h1 style={{fontSize:42,marginBottom:30}}>
        APEX SIGNALS
      </h1>

      <div style={{marginBottom:20}}>

        <input
          value={symbol}
          onChange={(e)=>setSymbol(e.target.value)}
          style={{
            padding:12,
            fontSize:18,
            width:200,
            marginRight:10,
            background:"#000",
            color:"#00ff88",
            border:"1px solid #00ff88"
          }}
        />

        <button
          onClick={analyse}
          style={{
            padding:"12px 20px",
            background:"#00ff88",
            border:"none",
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          ANALYSE
        </button>

      </div>

      {loading && <p>Loading analysis...</p>}

      {error && (
        <div style={{
          background:"#3f0d12",
          padding:20,
          marginTop:20,
          color:"#ff5a5a"
        }}>
          ERROR: {error}
        </div>
      )}

      {data && (

        <div style={{
          marginTop:30,
          background:"#000",
          padding:20,
          border:"1px solid #00ff88"
        }}>

          <h2>{data.symbol}</h2>

          <p>Price: {data.price}</p>

          <p>24h Change: {data.change24h}%</p>

          <p>Volume: {data.volume24h}</p>

          <p>High 24h: {data.high24h}</p>

          <p>Low 24h: {data.low24h}</p>

          <p>Support: {data.support}</p>

          <p>Resistance: {data.resistance}</p>

          <p>Bullish Projection: {data.bullishProjection}</p>

          <p>Bearish Projection: {data.bearishProjection}</p>

          <p>Open Interest: {data.openInterest}</p>

          <p>Funding Rate: {data.fundingRate}</p>

        </div>

      )}

    </div>
  );
}