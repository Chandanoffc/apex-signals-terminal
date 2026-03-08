import { Router } from "express";
import { runAnalysis } from "./analysisEngine.js";

const router = Router();

router.get("/analyze/:symbol", async (req, res) => {

  try {

    let symbol = req.params.symbol.toUpperCase();

    if (!symbol.endsWith("USDT")) {
      symbol = symbol + "USDT";
    }

    const data = await runAnalysis(symbol);

    res.json(data);

  } catch (error) {

    console.error("Analysis error:", error);

    res.status(500).json({
      error: "Analysis failed"
    });

  }

});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;