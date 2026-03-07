export function generateNarrative(data){

    if(data.bias === "bullish"){
      return "Market momentum is currently bullish with upside continuation possible.";
    }
  
    if(data.bias === "bearish"){
      return "Market structure indicates bearish pressure with potential downside.";
    }
  
    return "Market conditions are neutral with mixed technical signals.";
  }