// 1. In v3, the class is the 'default' export
const YahooFinance = require('yahoo-finance2').default;

// 2. Instantiate the library
const yahooFinance = new YahooFinance();

const getMarketData = async (ticker) => {
    try {
        // Indian Stock helper: Auto-append .NS if missing
        const symbol = ticker.toUpperCase().endsWith('.NS')
            ? ticker.toUpperCase()
            : `${ticker.toUpperCase()}.NS`;

        console.log(`📡 [v3.13] Fetching Deep Intel: ${symbol}`);

        /**
         * 3. Use quoteSummary to get advanced metrics.
         * We request 'price' (for current price) and 'summaryDetail' (for P/E and Dividends).
         */
        const result = await yahooFinance.quoteSummary(symbol, {
            modules: ['price', 'summaryDetail', 'defaultKeyStatistics']
        });

        if (!result) return null;

        const { price, summaryDetail, defaultKeyStatistics } = result;

        return {
            // --- PRICE DATA ---
            currentPrice: price.regularMarketPrice,
            dayHigh: price.regularMarketDayHigh,
            dayLow: price.regularMarketDayLow,
            currency: price.currency,

            // --- VALUATION & RATIOS ---
            // trailingPE is the standard P/E ratio (Trailing Twelve Months)
            peRatio: summaryDetail.trailingPE || "N/A",
            marketCap: price.marketCap, // Value in actual currency

            // --- DIVIDENDS ---
            // dividendYield is usually a decimal (e.g., 0.015 for 1.5%)
            dividendYield: summaryDetail.dividendYield
                ? (summaryDetail.dividendYield * 100).toFixed(2) + "%"
                : "0.00%",
            lastDividendValue: summaryDetail.lastDividendValue || 0,

            // --- ANALYSIS HELPERS ---
            fiftyDayAverage: summaryDetail.fiftyDayAverage,
            trend: price.regularMarketPrice > summaryDetail.fiftyDayAverage ? "BULLISH" : "BEARISH",
            marketState: price.marketState
        };
    } catch (error) {
        console.error(`❌ Market Data Error for ${ticker}:`, error.message);
        return null;
    }
};

module.exports = { getMarketData };