export function generateSignals(data){

    let bull = 0;
    let bear = 0;
  
    if(data.rsi < 35) bull++;
    if(data.rsi > 65) bear++;
  
    if(data.price > data.sma20){
      bull++;
    } else {
      bear++;
    }
  
    let bias = "neutral";
  
    if(bull > bear) bias = "bullish";
    if(bear > bull) bias = "bearish";
  
    return {
      bullScore: bull,
      bearScore: bear,
      bias
    };
  }