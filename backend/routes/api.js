import { Router } from "express";
import { runAnalysis } from "./analysisEngine.js";

const router = Router();

router.get("/analyze/:symbol", async (req,res)=>{

  let symbol = req.params.symbol.toUpperCase();

  if(!symbol.endsWith("USDT"))
    symbol += "USDT";

  const data = await runAnalysis(symbol);

  res.json(data);

});

router.get("/health",(req,res)=>{
  res.json({status:"ok"});
});

export default router;