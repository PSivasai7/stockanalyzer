# Stock Analyzer

A high-level, full-stack application designed to validate trading logic, reduce confirmation bias, and provide AI-driven critiques on trading theses. 

## Features

* **AI Trade Validation:** Users input a stock ticker, entry price, timeframe (Intraday, Swing, Long Term), and their trading thesis. The system returns an AI critique, suggested Stop Loss (SL), and Target Price (TP).
* **Real-Time Market Data:** Integrates the `yahoo-finance2` library to deliver low-latency price tracking, technical indicators, P/E ratios, and relevant financial news.
* **Logic Vault:** A dedicated history list where users can track and review their past trading theses and AI critiques.
* **Market Intel:** A specialized section for tracking current stock fundamentals and the latest news.
* **Academy Page:** Built-in user instructions and educational resources on how to effectively use the platform.

## Tech Stack

* **Frontend:** React
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **AI Integration:** Groq API (Llama 3)
* **Financial Data:** Yahoo Finance API (`yahoo-finance2`)

## Getting Started

### Prerequisites

* Node.js
* MySQL Server
* Groq API Key

### Installation

1. Clone the repository and install dependencies:

```bash
git clone [https://github.com/your-username/stock-analyzer.git](https://github.com/your-username/stock-analyzer.git)
cd stock-analyzer
cd server
npm install
cd ../client
npm install
