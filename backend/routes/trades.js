const express = require("express");
const router = express.Router();
const pool = require("../database");
const { protect } = require("../middleware/authMiddleware");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { getMarketData } = require('../utils/marketData');


// GET: Fetch live price for a specific ticker
router.get("/price/:ticker", protect, async (req, res) => {
  try {
    const data = await getMarketData(req.params.ticker);
    if (!data) return res.status(404).json({ error: "Ticker not found" });
    res.json({
      price: data.currentPrice,
      trend: data.trend,
      dayHigh: data.dayHigh,
      dayLow: data.dayLow,
      currency: data.currency,
      peRatio: data.peRatio,
      marketCap: data.marketCap,
      dividendYield: data.dividendYield,
      lastDividendValue: data.lastDividendValue,
      fiftyDayAverage: data.fiftyDayAverage,
      marketState: data.marketState
    });
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// GET: Fetch all trades for the logged-in user
router.get("/history", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      "SELECT * FROM trade_theses WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


// POST: Analyze a Trade Thesis
router.post("/analyze", protect, async (req, res) => {
  try {
    const userId = req.user.id; // From our protect middleware
    const { ticker, timeframe, trade_type, entry_price, user_reason } =
      req.body;
    const marketData = await getMarketData(ticker);
    // 1. Craft a detailed prompt for a JSON response
    // const systemPrompt = `
    //         You are a professional Risk Manager. Analyze the user's trade logic.
    //         Respond ONLY in a structured JSON format with the following keys:
    //         - "critique": (A critical 3-point analysis of their logic)
    //         - "prediction": (One word: "SUCCESS" or "LOSS" based on probability)
    //         - "confidence": (An integer 0-100)
    //         - "suggested_sl": (A numeric stop-loss price based on standard risk management for the given trade_type)
    //         - "suggested_tp": (A numeric take-profit price for a 1:2 risk-reward ratio)
    //     `;

    // const userContent = `
    //         Ticker: ${ticker}
    //         Timeframe: ${timeframe}
    //         Trade Type: ${trade_type}
    //         Entry Price: ${entry_price}
    //         My Logic: ${user_reason}
    //     `;
    const systemPrompt = `
            You are a Data-Driven Risk Manager. You have access to LIVE market data.
            Compare the user's logic against the provided market stats.
            If the user wants to buy but the trend is BEARISH, be extra critical.
            Respond ONLY in JSON.
            "critique": (A critical 3-point analysis of their logic)
             - "prediction": (One word: "SUCCESS" or "LOSS" based on probability)
             - "confidence": (An integer 0-100)
             - "suggested_sl": (A numeric stop-loss price based on standard risk management for the given trade_type)
             - "suggested_tp": (A numeric take-profit price for a 1:2 risk-reward ratio)
        `;
    const userContent = `
            REAL MARKET DATA for ${ticker}:
            - Current Price: ${marketData?.currentPrice || "N/A"}
            - 50-Day Trend: ${marketData?.trend || "Unknown"}
            
            USER THESIS:
            - Reason: ${user_reason}
            - Entry Price: ${entry_price}
        `;

    // 2. Call the AI with JSON Mode enabled
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, // Forces JSON output
    });

    // 3. Parse the AI result
    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // 4. Save to MySQL using the new columns we created
    const sql = `
            INSERT INTO trade_theses 
            (user_id, ticker, timeframe, trade_type, entry_price, user_reason, ai_critique, suggested_sl, suggested_tp, prediction_confidence, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
        `;

    const [result] = await pool.execute(sql, [
      userId,
      ticker,
      timeframe,
      trade_type,
      entry_price,
      user_reason,
      aiResponse.critique, // Just the value
      aiResponse.suggested_sl,
      aiResponse.suggested_tp,
      aiResponse.confidence,
    ]);

    // 5. Send results back to the frontend with market fundamentals
    res.status(201).json({
      message: "Analysis Complete!",
      analysis: {
        ...aiResponse,
        fundamentals: {
          pe: marketData?.peRatio || "N/A",
          dividendYield: marketData?.dividendYield || "0.00%",
          marketCap: marketData?.marketCap || "N/A",
          dayHigh: marketData?.dayHigh || "N/A",
          dayLow: marketData?.dayLow || "N/A",
          fiftyDayAverage: marketData?.fiftyDayAverage || "N/A",
          trend: marketData?.trend || "Unknown"
        },
        news: [] // Placeholder for news - can be extended with news API
      },
      tradeId: result.insertId,
    });
  } catch (err) {
    console.error("Analysis Error:", err);
    res.status(500).json({ error: "Could not process analysis" });
  }
});

module.exports = router;
