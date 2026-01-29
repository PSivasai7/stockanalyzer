import React, { useState, useEffect } from "react";
import axios from "axios";

const Analyzer = () => {
  const [ticker, setTicker] = useState("");
  const [reason, setReason] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [tradeType, setTradeType] = useState("SWING");
  const [entryPrice, setEntryPrice] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [livePrice, setLivePrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // 1. Fetch function
  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/trades/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed");
    }
  };

  // 2. Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // 3. Live Price & News Fetcher with Debounce
  useEffect(() => {
    const fetchPrice = async () => {
      if (ticker.length < 2) {
        setLivePrice(null);
        return;
      }

      setPriceLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:5000/api/trades/price/${ticker}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLivePrice(res.data);
      } catch (err) {
        setLivePrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPrice();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [ticker]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis(null);

    const token = localStorage.getItem("token");
    const tradeData = {
      ticker: ticker.toUpperCase(),
      user_reason: reason,
      timeframe: timeframe,
      trade_type: tradeType,
      entry_price: parseFloat(entryPrice),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/trades/analyze",
        tradeData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Ensure your backend sends 'analysis', 'news', and 'fundamentals'
      setAnalysis(response.data.analysis);
      fetchHistory();
    } catch (error) {
      console.error("Analysis failed:", error.response?.data?.error || error.message);
      alert("Unauthorized or Session Expired. Please Login again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto p-6 md:p-10">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              LogicGate Analyzer
            </h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">
              Professional Risk Auditor
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1 flex justify-between">
                Stock Name {priceLoading && <span className="animate-pulse text-amber-500 text-[10px]">VERIFYING...</span>}
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all uppercase"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="EX: RELIANCE"
                required
              />
            </div>
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-slate-400 ml-1">
                Entry Price (₹) {livePrice && <span className="text-slate-600 text-[10px] ml-2 font-mono">Market: ₹{livePrice.price}</span>}
              </label>
              <input
                type="number"
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all ${livePrice ? 'border-amber-600/30 shadow-inner' : ''}`}
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder={livePrice ? `Enter the entry price ,Live: ${livePrice.price}` : "0.00"}
                required
              />
              {livePrice && (
                <div className={`absolute right-4 top-10 text-[10px] font-black px-2 py-0.5 rounded ${livePrice.trend === 'BULLISH' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {livePrice.trend}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">Timeframe</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="1m">1 Minute (Scalp)</option>
                <option value="15m">15 Minutes (Intraday)</option>
                <option value="1h">1 Hour (Daily)</option>
                <option value="1D">1 Day (Swing)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">Trade Type</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer" value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                <option value="INTRADAY">Intraday</option>
                <option value="SWING">Swing</option>
                <option value="LONG_TERM">Investment</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Trading Thesis</label>
            <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none min-h-32" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain the technical pattern or fundamental reason..." required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 cursor-pointer bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-all">
            {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Auditing Thesis...</> : "Submit"}
          </button>
        </form>

        {/* --- DYNAMIC REPORT SECTION --- */}
        {analysis && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* 1. News & Fundamentals Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase">📰 Market Intel</h3>
                <div className="space-y-4">
                  {analysis.news && analysis.news.length > 0 ? analysis.news.map((item, i) => (
                    <div key={i} className="group border-b border-slate-800 last:border-0 pb-3">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{item.title}</h4>
                      <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-bold">
                        <span>{item.publisher}</span>
                        <a href={item.link} target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-400">Read More →</a>
                      </div>
                    </div>
                  )) : <p className="text-slate-600 text-xs italic">No recent news found for this ticker.</p>}
                </div>
              </div> */}

            {/* <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">P/E Ratio</p>
                  <p className="text-xl font-bold text-slate-100">{analysis.fundamentals?.pe || "N/A"}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Dividend</p>
                  <p className="text-xl font-bold text-slate-100">{analysis.fundamentals?.dividendYield}%</p>
                </div>
                <div className="bg-amber-600 p-4 rounded-2xl text-center shadow-lg shadow-amber-900/20">
                  <p className="text-[10px] text-amber-100 uppercase font-bold mb-1">AI Verdict</p>
                  <p className="text-xl font-black text-white">{analysis.prediction}</p>
                </div>
              </div>
            </div> */}
            {/* --- FUNDAMENTALS BAR --- */}
            {/* <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">P/E Ratio</p>
                <p className="text-xl font-black text-white">{analysis.fundamentals?.pe}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Dividend</p>
                <p className="text-xl font-black text-white">{analysis.fundamentals?.dividendYield}%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Market Cap</p>
                <p className="text-xl font-black text-white">₹{analysis.fundamentals?.marketCap} Cr</p>
              </div>
            </div> */}

            {/* --- MARKET INTEL (NEWS) --- */}

            {/* <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2 uppercase italic text-xs">📰 Market Intel</h3>
              <div className="space-y-4">
                {analysis.news?.length > 0 ? analysis.news.map((item, i) => (
                  <div key={i} className="border-b border-slate-800 last:border-0 pb-3">
                    <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{item.publisher}</span>
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] text-amber-500 font-bold hover:underline">READ MORE →</a>
                    </div>
                  </div>
                )) : <p className="text-slate-600 text-xs italic text-center">No recent news headlines detected.</p>}
              </div>
            </div> */}
            {/* --- AI RESULTS SECTION --- */}
            {analysis && (
              <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-center text-xl font-bold text-slate-200 bg-amber-600 rounded-b-full">Analysis:</h2>
                {/* Fundamental Quick-Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">P/E Ratio</p>
                    <p className="text-xl font-bold text-slate-200">{analysis.fundamentals?.pe}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Market Cap</p>
                    <p className="text-xl font-bold text-slate-200">₹{analysis.fundamentals?.marketCap} Cr</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Dividend</p>
                    <p className="text-xl font-bold text-slate-200">{analysis.fundamentals?.dividendYield}%</p>
                  </div>
                  <div className="bg-amber-600/20 border border-amber-600/30 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-amber-500 uppercase font-black mb-1">Trend</p>
                    <p className="text-xl font-black text-amber-500 uppercase italic">{analysis.fundamentals?.trend || "N/A"}</p>
                  </div>
                </div>

                {/* Market Intel (News) Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest italic">📰 Market Intel</h3>
                  <div className="space-y-4">
                    {analysis.news && analysis.news.length > 0 ? analysis.news.map((item, i) => (
                      <div key={i} className="group border-b border-slate-800 last:border-0 pb-3">
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{item.title}</h4>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase">
                          <span>{item.publisher}</span>
                          <a href={item.link} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400 transition-all">READ MORE →</a>
                        </div>
                      </div>
                    )) : <p className="text-slate-600 text-xs italic">No specific news found for this ticker.</p>}
                  </div>
                </div>

                {/* ... (Rest of your existing AI Critique and SL/TP section) ... */}
              </div>
            )}


            {/* 2. Main AI Report Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold">Risk Management Strategy</h2>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold">{analysis.confidence}% CONFIDENCE</span>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6 text-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">🛑 Stop Loss</p>
                    <p className="text-3xl font-mono text-red-500 font-bold">₹{analysis.suggested_sl}</p>
                  </div>
                  <div className="border-l border-slate-800">
                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">🎯 Target Price</p>
                    <p className="text-3xl font-mono text-green-500 font-bold">₹{analysis.suggested_tp}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-amber-500 font-bold mb-2 text-sm uppercase">Logic Breakdown:</h3>
                  <p className="bg-slate-950 p-5 rounded-xl text-slate-300 italic text-sm leading-relaxed border border-slate-800 whitespace-pre-line">
                    {analysis.critique}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* --- HISTORY SECTION --- */}
        <div className="mt-20 space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-100">The Logic Vault</h2>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {history.map((trade) => (
              <div key={trade.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl hover:border-amber-500/50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-white">{trade.ticker} <span className="text-[10px] text-slate-600">({trade.trade_type})</span></h4>
                    <p className="text-slate-500 text-[10px] uppercase font-bold mt-1">{new Date(trade.created_at).toDateString()} • {trade.timeframe}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${trade.prediction_confidence > 75 ? 'text-green-400' : 'text-amber-500'}`}>{trade.prediction_confidence}% AI Score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;