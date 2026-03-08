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

    try{

      const sym = symbol.toUpperCase();

      const res = await fetch(
        `https://apex-signals-terminal.onrender.com/api/analyze/${sym}`
      );

      if(!res.ok){
        throw new Error("API request failed");
      }

      const json = await res.json();

      setData(json);

    }catch(err){

      console.error(err);
      setError(err.message);

    }

    setLoading(false);
  }

  return (
    <div style={{padding:40,color:"#00ff88",fontFamily:"monospace"}}>

      <h1>APEX SIGNALS</h1>

      <input
        value={symbol}
        onChange={(e)=>setSymbol(e.target.value)}
        style={{
          padding:10,
          fontSize:18,
          marginRight:10
        }}
      />

      <button
        onClick={analyse}
        style={{
          padding:10,
          background:"#00ff88",
          color:"#000"
        }}
      >
        ANALYSE
      </button>

      {loading && <p>Loading...</p>}

      {error && (
        <div style={{color:"red",marginTop:20}}>
          ERROR: {error}
        </div>
      )}

      {data && (
        <pre style={{marginTop:20}}>
          {JSON.stringify(data,null,2)}
        </pre>
      )}

    </div>
  );
}