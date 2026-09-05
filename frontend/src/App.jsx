import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  ShieldAlert,
  Search,
  Sparkles,
  Activity,
  Scale,
  X,
  Layers,
  Clock,
  HelpCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzedStocks, setAnalyzedStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8080/history');
        if (response.ok) {
          const data = await response.json();
          const uniqueStocks = Array.from(new Map(data.map(item => [item.ticker, item])).values());
          setAnalyzedStocks(uniqueStocks.reverse());
        }
      } catch (err) {
        console.error("Failed to load database history:", err);
      }
    };
    fetchHistory();
  }, []);

  const fetchAnalysis = async (symbolToFetch) => {
    const sym = (symbolToFetch || ticker).trim().toUpperCase();
    if (!sym) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/riskper?ticker=${sym}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${sym}. Please verify the ticker.`);
      }
      const data = await response.json();
      setSelectedStock(data);
      setAnalyzedStocks((prev) => {
        const filtered = prev.filter((item) => item.ticker !== data.ticker);
        return [data, ...filtered];
      });
      setTicker('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeStock = (tickerToRemove, e) => {
    e.stopPropagation();
    const updated = analyzedStocks.filter((s) => s.ticker !== tickerToRemove);
    setAnalyzedStocks(updated);
    if (selectedStock?.ticker === tickerToRemove) {
      setSelectedStock(updated[0] || null);
    }
  };

  const getRiskDetails = (risk) => {
    if (risk <= 35) {
      return {
        label: 'Low Risk',
        investVerdict: 'Safe / Favorable',
        color: 'text-[#00D09C]',
        bgBadge: 'bg-[#e8faf5] text-[#00a37a] border-[#b4eedc]',
        barColor: 'bg-[#00D09C]',
        description: 'Historical volatility is subdued and market sentiment remains predominantly positive. Favorable for defensive or long-term allocation.',
        icon: CheckCircle2
      };
    }
    if (risk <= 60) {
      return {
        label: 'Moderate Risk',
        investVerdict: 'Balanced / Proceed with Stop-loss',
        color: 'text-amber-500',
        bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
        barColor: 'bg-amber-400',
        description: 'Typical market fluctuations. Sentiment is balanced or mixed. Standard position sizing recommended.',
        icon: AlertTriangle
      };
    }
    return {
      label: 'High Risk',
      investVerdict: 'Speculative / Caution Advised',
      color: 'text-rose-500',
      bgBadge: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      description: 'Elevated price variance and negative or polarized news sentiment. Better suited for high-risk tolerance traders.',
      icon: Flame
    };
  };

  const riskMeta = selectedStock ? getRiskDetails(selectedStock.riskPercentage) : null;
  const chartData = analyzedStocks.map((item) => ({
    name: item.ticker,
    'Risk Score (%)': item.riskPercentage,
    'Volatility (60% wt)': item.volatilityScore,
    'Sentiment (40% wt)': item.sentimentScore
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-[#EBECEF] rounded-xl shadow-lg text-xs">
          <p className="font-bold text-[#232733] mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#7C7E8C]">{entry.name}:</span>
              <span className="font-semibold text-[#232733]">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#44475b]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#EBECEF] sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00D09C] flex items-center justify-center shadow-md shadow-[#00D09C]/20 transition-transform hover:scale-105">
              <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-[#232733] tracking-tight">Equity<span className="text-[#00D09C]">Sense</span></span>
                <span className="text-[10px] bg-[#E8FAF5] text-[#00A37A] font-semibold px-2 py-0.5 rounded-full">Your Investment Buddy</span>
              </div>
              <p className="text-[11px] text-[#7C7E8C]">Nilay-Anisha-Khushi</p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={(e) => { e.preventDefault(); fetchAnalysis(); }} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9DA8]" />
              <input
                type="text"
                placeholder="Search stocks, eg. JPM, AAPL, NVDA"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-80 bg-[#F4F6F8] border border-transparent hover:border-[#DFE0E6] focus:border-[#00D09C] rounded-xl pl-10 pr-4 py-2 text-sm text-[#232733] placeholder-[#9B9DA8] focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00D09C] hover:bg-[#00ba8b] text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-sm shadow-[#00D09C]/30 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? 'Analyzing...' : 'Search'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* History / Active Tabs */}
        {analyzedStocks.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Layers className="w-4 h-4 text-[#7C7E8C] mr-1" />
            {analyzedStocks.map((item) => {
              const isSelected = selectedStock?.ticker === item.ticker;
              const details = getRiskDetails(item.riskPercentage);
              return (
                <button
                  key={item.ticker}
                  onClick={() => setSelectedStock(item)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${isSelected
                      ? 'bg-white border-[#00D09C] text-[#232733] shadow-sm ring-1 ring-[#00D09C]'
                      : 'bg-white/80 border-[#E5E7EB] text-[#7C7E8C] hover:border-[#C7C9D1]'
                    }`}
                >
                  <span className="font-bold">{item.ticker}</span>
                  <span className={`text-[11px] ${details.color}`}>{item.riskPercentage}%</span>
                  <X
                    className="w-3.5 h-3.5 text-[#9B9DA8] hover:text-rose-500 cursor-pointer transition-colors"
                    onClick={(e) => removeStock(item.ticker, e)}
                  />
                </button>
              );
            })}
          </div>
        )}

        {selectedStock ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Score & Summary Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#EBECEF] rounded-3xl p-7 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-extrabold text-[#232733] tracking-tight">{selectedStock.ticker}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskMeta.bgBadge}`}>
                        {riskMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#7C7E8C] mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#9B9DA8]" /> Real-time weighted evaluation
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#7C7E8C] block font-medium">Safe to invest?</span>
                    <span className={`text-sm font-bold ${riskMeta.color}`}>{riskMeta.investVerdict}</span>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#F7FAF9] border border-[#E5EFEA] rounded-2xl p-5 hover:border-[#00D09C]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#7C7E8C]">Investment Risk</span>
                      <riskMeta.icon className={`w-4 h-4 ${riskMeta.color}`} />
                    </div>
                    <div className={`text-3xl font-black mt-2 ${riskMeta.color}`}>
                      {selectedStock.riskPercentage}%
                    </div>
                    <div className="w-full bg-[#E5EFEA] h-2 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${riskMeta.barColor}`} style={{ width: `${Math.min(selectedStock.riskPercentage, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-[#7C7E8C] mt-2 block">The less the Better</span>
                  </div>

                  <div className="bg-[#FAF9F7] border border-[#EFECE5] rounded-2xl p-5 hover:border-amber-300 transition-colors">
                    <span className="text-xs font-semibold text-[#7C7E8C]">Market Volatility</span>
                    <div className="text-3xl font-black text-amber-500 mt-2">
                      {selectedStock.volatilityScore}
                    </div>
                    <span className="text-[11px] font-medium text-[#44475b] mt-3 block">Price Fluctuation</span>
                    <span className="text-[10px] text-[#7C7E8C] block">Higher = larger price swings</span>
                  </div>

                  <div className="bg-[#F6F8FB] border border-[#E6EBF3] rounded-2xl p-5 hover:border-sky-300 transition-colors">
                    <span className="text-xs font-semibold text-[#7C7E8C]">Latest Market Sentiment Score</span>
                    <div className="text-3xl font-black text-sky-600 mt-2">
                      {selectedStock.sentimentScore}
                    </div>
                    <span className="text-[11px] font-medium text-[#44475b] mt-3 block">Market Sentiment</span>
                    <span className="text-[10px] text-[#7C7E8C] block">0 (Bullish) to 100 (Bearish)</span>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="border-t border-[#F0F1F4] pt-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00A37A] tracking-wide uppercase mb-3">
                    <Sparkles className="w-4 h-4 text-[#00D09C]" /> What world is saying about it right now?
                  </div>
                  <p className="text-sm text-[#44475B] leading-relaxed bg-[#F8FAFC] border border-[#ECEFF3] p-4 rounded-2xl font-normal">
                    {selectedStock.summary}
                  </p>
                </div>
              </div>

              {/* Comparative Table */}
              {analyzedStocks.length > 1 && (
                <div className="bg-white border border-[#EBECEF] rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-5 h-5 text-[#00D09C]" />
                    <h3 className="font-bold text-base text-[#232733]">Comparison Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="h-64 w-full bg-[#FAFBFC] border border-[#ECEFF3] rounded-2xl p-4 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBECEF" />
                          <XAxis dataKey="name" stroke="#7C7E8C" fontSize={11} tickLine={false} />
                          <YAxis stroke="#7C7E8C" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                          <Bar dataKey="Risk Score (%)" fill="#00D09C" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Volatility (60% wt)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Sentiment (40% wt)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#F0F1F4] text-[#7C7E8C] font-semibold">
                          <th className="py-3 px-4">Ticker</th>
                          <th className="py-3 px-4">Risk %</th>
                          <th className="py-3 px-4">Volatility</th>
                          <th className="py-3 px-4">Sentiment</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4F6F8]">
                        {analyzedStocks.map((item) => {
                          const det = getRiskDetails(item.riskPercentage);
                          return (
                            <tr
                              key={item.ticker}
                              onClick={() => setSelectedStock(item)}
                              className="hover:bg-[#F9FBFA] cursor-pointer transition-colors"
                            >
                              <td className="py-3.5 px-4 font-bold text-[#232733]">{item.ticker}</td>
                              <td className={`py-3.5 px-4 font-bold ${det.color}`}>{item.riskPercentage}%</td>
                              <td className="py-3.5 px-4 text-[#44475B] font-medium">{item.volatilityScore}</td>
                              <td className="py-3.5 px-4 text-[#44475B] font-medium">{item.sentimentScore}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${det.bgBadge}`}>
                                  {det.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Explainer Sidebar */}
            <div className="space-y-6">
              {/* Score Guide */}
              <div className="bg-white border border-[#EBECEF] rounded-3xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-5 h-5 text-[#00D09C]" />
                  <h3 className="font-bold text-base text-[#232733]">Risk Interpretation</h3>
                </div>
                <p className="text-xs text-[#7C7E8C] mb-4">
                  How to read the Risk Percentage to make informed investing decisions:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#E8FAF5] rounded-xl border border-[#B4EEDC]">
                    <div className="flex items-center justify-between font-bold text-[#008F6B]">
                      <span>0% - 35%</span>
                      <span>Safe / Low Risk</span>
                    </div>
                    <p className="text-[#325247] text-[11px] mt-1">
                      Stable price performance, calm volatility, and positive news bias. Favorable for long-term investments.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between font-bold text-amber-800">
                      <span>36% - 60%</span>
                      <span>Moderate Risk</span>
                    </div>
                    <p className="text-amber-900 text-[11px] mt-1">
                      Normal market swing levels. Suitable for regular equity allocation with standard risk controls.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <div className="flex items-center justify-between font-bold text-rose-800">
                      <span>61% - 100%</span>
                      <span>High / Speculative</span>
                    </div>
                    <p className="text-rose-900 text-[11px] mt-1">
                      High price erraticism or negative news headwinds. Higher chance of rapid drawdowns.
                    </p>
                  </div>
                </div>
              </div>

              {/* What each score means */}
              <div className="bg-white border border-[#EBECEF] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#00D09C]" />
                  <h3 className="font-bold text-base text-[#232733]">Metrics Guide</h3>
                </div>

                <div className="space-y-3 text-xs text-[#55586B]">
                  <div>
                    <span className="font-bold text-[#232733] block">Volatility Score (60% Weight)</span>
                    <span>Computed using annualised standard deviations from Yahoo Finance. Measures price instability.</span>
                  </div>
                  <div className="border-t border-[#F0F1F4] pt-2">
                    <span className="font-bold text-[#232733] block">Sentiment Score (40% Weight)</span>
                    <span>FinBERT classifies live financial news headlines. Scored 0 (Positive) to 100 (Negative).</span>
                  </div>
                </div>
              </div>

              {/* Quick watchlist */}
              <div className="bg-white border border-[#EBECEF] rounded-3xl p-6 shadow-xs">
                <span className="text-xs font-bold text-[#7C7E8C] uppercase tracking-wider block mb-3">Popular Equities</span>
                <div className="flex flex-wrap gap-2">
                  {['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'JPM'].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => fetchAnalysis(sym)}
                      className="px-3.5 py-1.5 bg-[#F4F6F8] hover:bg-[#E8FAF5] hover:text-[#00A37A] border border-transparent hover:border-[#00D09C]/40 text-xs font-bold rounded-xl text-[#44475B] transition-colors cursor-pointer"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#EBECEF] rounded-3xl p-14 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[#E8FAF5] text-[#00D09C] flex items-center justify-center mx-auto mb-4 animate-glow">
              <TrendingUp className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#232733]">Discover Equity Risks & Sentiment</h2>
            <p className="text-xs text-[#7C7E8C] mt-2 leading-relaxed">
              Analyze public market companies with FinBERT NLP and Gemini synthesis mapped against annualized price volatility.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => fetchAnalysis('JPM')}
                className="inline-flex items-center gap-2 bg-[#00D09C] hover:bg-[#00ba8b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Analyze J.P. Morgan (JPM) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}