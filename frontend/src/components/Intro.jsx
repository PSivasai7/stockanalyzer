import React from "react";
import { Link } from "react-router-dom";

const Intro = () => {
    const guide = [
        { title: "🛑 Stop Loss (SL)", text: "Your safety exit. If the stock hits this price, the trade logic is dead. We exit to protect your capital." },
        { title: "🎯 Target Price", text: "Where we take the profit. LogicGate aims for a 1:2 ratio—risking ₹1 to earn ₹2." },
        { title: "🧠 Confidence Score", text: "AI's certainty based on live news sentiment and historical price volatility." },
        { title: "📰 Market Intel", text: "Real-time news headlines that could affect the stock's direction unexpectedly." }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-amber-500/30">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-amber-400 to-amber-700 bg-clip-text text-transparent italic tracking-tighter">
                        LOGICGATE ACADEMY
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Don't trade on emotions. Trade on validated logic.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guide.map((item, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-amber-500/40 transition-all group">
                            <h3 className="text-amber-500 font-bold text-xl mb-3 group-hover:translate-x-1 transition-transform">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-6">
                    <Link to="/analyze" className="px-16 py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-full shadow-2xl shadow-amber-900/40 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                        Enter the Vault
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Intro;