const express = require("express");
const cors = require("cors");
const pool = require("./database");
require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const authRoutes = require("./routes/auth");
const tradeRoutes = require("./routes/trades");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);

app.get("/", (req, res) => {
  res.send("site is running");
});

// app.post("/api/trades", async (req, res) => {
//   try {
//     const { user_id, ticker, user_reason } = req.body;

//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a professional bearish stock analyst. Your job is to find flaws in a trader's logic. Be concise and give 3 reasons why their trade might fail.",
//         },
//         {
//           role: "user",
//           content: `I want to buy ${ticker} because: ${user_reason}`,
//         },
//       ],
//       model: "llama-3.3-70b-versatile",
//     });

//     const ai_critique =
//       chatCompletion.choices[0]?.message?.content || "No critique generated.";

//     const sql =
//       "INSERT INTO trade_theses (user_id, ticker, user_reason, ai_critique) VALUES (?, ?, ?, ?)";

//     const [result] = await pool.execute(sql, [
//       user_id,
//       ticker,
//       user_reason,
//       ai_critique,
//     ]);

//     res.status(201).json({
//       message: "LogicGate has analyzed your trade!",
//       ai_critique: ai_critique,
//       tradeId: result.insertId,
//     });
//   } catch (err) {
//     console.error("AI or DB Error:", err);
//     res.status(500).json({ error: "Analysis failed" });
//   }
// });

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
