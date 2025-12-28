import { useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, Activity, RefreshCw, Clock, AlertTriangle, CheckCircle, BrainCircuit, LogOut, Wallet, Star } from 'lucide-react';
import TradeHistory from './TradeHistory';
import Sidebar from './Sidebar';
import Portfolio from './Portfolio'; 

function Dashboard({ onLogout, user, onUpdateBalance, onUpdateWatchlist }) {
  const [stock, setStock] = useState('TATASTEEL'); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState('');
  
  // BEHAVIORAL STATE
  const [userIntent, setUserIntent] = useState(null); 
  const [showConfirmation, setShowConfirmation] = useState(false); 
  
  // NEW: Quantity State
  const [quantity, setQuantity] = useState(1);

  // 1. FETCH DATA
  const getPrediction = async () => {
    if(!stock) return;
    setLoading(true);
    setError('');
    setData(null);
    setUserIntent(null);
    setShowConfirmation(false);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/predict/${stock}`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Server Error. Check Backend.");
    }
    setLoading(false);
  };

  // 2. RETRAIN MODEL
  const handleRetrain = async () => {
    if(!stock) return;
    setRetraining(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/train/${stock}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to retrain.");
    }
    setRetraining(false);
  };

  // 3. EXECUTE TRADE
  const executeTrade = async () => {
    if (!user || !user.id) {
      alert("⚠️ Error: User ID not found. Please Logout and Log in again.");
      return;
    }
    if (!data || !userIntent) {
      alert("⚠️ Error: Missing trade details.");
      return;
    }
    if (quantity <= 0) {
        alert("⚠️ Quantity must be at least 1");
        return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/trade', {
        userId: user.id,
        stock: data.symbol,
        type: userIntent,
        price: data.current_price,
        quantity: quantity // Sending user selected quantity
      });

      // UPDATE BALANCE INSTANTLY
      onUpdateBalance(response.data.newBalance);

      // SHOW SUCCESS
      setShowConfirmation(true);
      
    } catch (err) {
      console.error("Trade Error:", err);
      const msg = err.response?.data?.error || "Connection Failed";
      alert(`❌ Trade Failed: ${msg}`);
    }
  };

  // --- BEHAVIORAL LOGIC ---
  const analyzeBehavior = (intent) => {
    setUserIntent(intent);
    setShowConfirmation(false);
  };

  const getBehavioralAlert = () => {
    if (!data || !userIntent) return null;

    // BUY SCENARIOS
    if (userIntent === 'BUY') {
        if (data.signal === 'SELL') {
            return {
                type: 'danger',
                title: '⚠️ FOMO DETECTED',
                message: "You want to BUY, but the price is dropping. You might be chasing a hype train.",
                allowOverride: true
            };
        }
        if (data.confidence < 50) {
             return {
                type: 'warning',
                title: '⚠️ RISKY GAMBLE',
                message: "Market volatility is extremely high. Buying now is gambling.",
                allowOverride: true
            };
        }
        return {
            type: 'success',
            title: '✅ RATIONAL DECISION',
            message: "Smart move. The market trend supports your decision.",
            allowOverride: true
        };
    }

    // SELL SCENARIOS
    if (userIntent === 'SELL') {
        if (data.signal === 'BUY') {
            return {
                type: 'danger',
                title: '🛑 PANIC SELLING DETECTED',
                message: "Don't sell now! The market is likely to recover. You are acting on fear.",
                allowOverride: true
            };
        }
        return {
            type: 'success',
            title: '✅ SMART EXIT',
            message: "Good choice. Protecting your capital is important right now.",
            allowOverride: true
        };
    }
  };
  
  const alert = getBehavioralAlert();

  // Check watchlist
  const isFavorite = user?.watchlist?.includes(data?.symbol);

  const toggleWatchlist = async () => {
    if (!user || !data) return;
    try {
        const res = await axios.post('http://localhost:5000/api/watchlist/toggle', {
        userId: user.id,
        symbol: data.symbol
        });
        onUpdateWatchlist(res.data.watchlist);
    } catch (err) {
        console.error("Watchlist Error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
      
      {/* 1. SIDEBAR */}
      <Sidebar 
        watchlist={user?.watchlist} 
        onSelect={(symbol) => {
            setStock(symbol);
            setTimeout(() => {
                // Auto trigger fetch could go here
            }, 0);
        }} 
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto h-screen">
        
        {/* --- HEADER --- */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-10 px-4">
            <div>
                <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    TradeMorph
                </h1>
                <p className="text-slate-400 text-sm tracking-wider">Behavioral Insight Engine</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-slate-400 text-xs uppercase tracking-widest">Virtual Balance</span>
                    <div className="flex items-center gap-2 text-green-400 font-mono font-bold text-xl">
                        <Wallet className="h-5 w-5" />
                        ₹{user?.balance !== undefined ? user.balance.toLocaleString() : "0.00"}
                    </div>
                </div>

                <div className="hidden md:block text-right">
                    <p className="text-white font-semibold">{user?.username || "Trader"}</p>
                    <p className="text-xs text-slate-500">Pro Account</p>
                </div>

                <button 
                    onClick={onLogout}
                    className="group flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-4 py-2 rounded-xl transition-all duration-300"
                >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline font-medium">Logout</span>
                </button>
            </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="flex w-full max-w-md bg-slate-800 rounded-full p-2 shadow-lg mb-8 border border-slate-700">
            <input 
            type="text" 
            value={stock} 
            onChange={(e) => setStock(e.target.value.toUpperCase())} 
            onKeyDown={(e) => e.key === 'Enter' && getPrediction()}
            placeholder="Search Stock..."
            className="bg-transparent flex-1 px-4 outline-none text-white placeholder-slate-500"
            />
            <button 
            onClick={getPrediction} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition"
            >
            {loading ? <Activity className="animate-spin h-5 w-5"/> : <Search className="h-5 w-5"/>}
            </button>
        </div>

        {error && <div className="text-red-400 bg-red-900/20 p-3 rounded mb-4">{error}</div>}

        {/* --- DASHBOARD CONTENT --- */}
        {data && (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            
            {/* CHART & PRICE */}
            <div className="md:col-span-3 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight">{data.symbol}</h2>
                            <button 
                                onClick={toggleWatchlist}
                                className={`p-2 rounded-full transition ${isFavorite ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                                title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
                            >
                                <Star className={`h-6 w-6 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                            </button>
                        </div>
                        <p className="text-slate-400 text-sm">Live Market Analysis</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-mono font-semibold">₹{data.current_price}</h2>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold mt-2 ${data.signal === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {data.signal === 'BUY' ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
                            {data.signal} SIGNAL
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg mb-6 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span>Last Trained: <span className="text-slate-200 font-mono">{data.last_trained}</span></span>
                    </div>
                    <button 
                        onClick={handleRetrain}
                        disabled={retraining}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-xs font-semibold transition border border-slate-600 hover:border-slate-500 hover:text-white"
                    >
                        <RefreshCw className={`h-3 w-3 ${retraining ? 'animate-spin' : ''}`} />
                        {retraining ? "Training..." : "Retrain Model"}
                    </button>
                </div>

                <div className="h-[300px] w-full bg-slate-900/50 rounded-xl p-2 border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.history}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} tickMargin={10} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 10}} domain={['auto', 'auto']} width={40} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* METRICS */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center flex flex-col justify-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">AI Confidence</p>
                <div className="text-3xl font-bold text-yellow-400">{data.confidence}%</div>
                <p className="text-slate-500 text-xs mt-1">Based on Risk/Volatility</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center flex flex-col justify-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Prediction</p>
                <div className={`text-2xl font-bold ${data.signal === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {data.signal === 'BUY' ? 'Price Going UP 🚀' : 'Price Going DOWN 📉'}
                </div>
                <p className="text-slate-500 text-xs mt-1">
                {data.signal === 'BUY' ? 'Looks good to invest.' : 'Better to wait.'}
                </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center flex flex-col justify-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Market Trend</p>
                <div className={`text-2xl font-bold ${data.signal === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {data.signal === 'BUY' ? 'Rising 📈' : 'Falling 📉'}
                </div>
            </div>

            {/* --- BEHAVIORAL ANALYZER --- */}
            <div className="md:col-span-3 bg-slate-800/80 border border-slate-600 rounded-2xl p-6 relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit className="w-32 h-32 text-blue-400" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                    Validate Your Decision
                </h3>
                
                {!showConfirmation ? (
                    <>
                        <p className="text-slate-400 text-sm mb-6">
                            Don't trade on emotion. Select an action to check for behavioral biases like FOMO.
                        </p>

                        {/* QUANTITY INPUT */}
                        <div className="mb-6 flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700 w-fit">
                            <label className="text-slate-300 font-semibold text-sm">Shares to Trade:</label>
                            <input 
                                type="number" 
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="bg-slate-800 text-white font-mono text-lg border border-slate-600 rounded-lg px-3 py-1 w-24 focus:outline-none focus:border-blue-500 transition"
                            />
                            <span className="text-slate-500 text-xs">
                                Est. Total: ₹{(data.current_price * quantity).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <button 
                                onClick={() => analyzeBehavior('BUY')}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition border-2 ${userIntent === 'BUY' ? 'bg-green-600 border-green-400' : 'bg-slate-700 border-transparent hover:bg-slate-600'}`}
                            >
                                I Plan to BUY
                            </button>
                            <button 
                                onClick={() => analyzeBehavior('SELL')}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition border-2 ${userIntent === 'SELL' ? 'bg-red-600 border-red-400' : 'bg-slate-700 border-transparent hover:bg-slate-600'}`}
                            >
                                I Plan to SELL
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 text-center animate-fade-in-up">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-green-400">Trade Executed</h3>
                        <p className="text-slate-300 mt-2">
                            Successfully {userIntent === 'BUY' ? 'BOUGHT' : 'SOLD'} {quantity} shares of {data.symbol}.
                        </p>
                        <button 
                            onClick={() => {setUserIntent(null); setShowConfirmation(false);}}
                            className="mt-4 text-sm text-slate-400 hover:text-white underline"
                        >
                            Analyze Another Trade
                        </button>
                    </div>
                )}

                {/* ALERT & ACTION BOX */}
                {alert && !showConfirmation && (
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start gap-4 animate-fade-in-up mt-4 ${alert.type === 'danger' ? 'bg-red-900/30 border-red-500/50 text-red-100' : alert.type === 'warning' ? 'bg-orange-900/30 border-orange-500/50 text-orange-100' : 'bg-green-900/30 border-green-500/50 text-green-100'}`}>
                        
                        <div className="flex gap-4 flex-1">
                            {alert.type === 'danger' || alert.type === 'warning' ? <AlertTriangle className="w-6 h-6 shrink-0" /> : <CheckCircle className="w-6 h-6 shrink-0" />}
                            <div>
                                <h4 className="font-bold text-lg">{alert.title}</h4>
                                <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                            </div>
                        </div>

                        {alert.allowOverride && (
                            <button 
                                onClick={executeTrade}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg font-bold text-sm shadow-lg ml-auto transition cursor-pointer hover:scale-105 active:scale-95 ${
                                    alert.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
                                    alert.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600' : 
                                    'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {alert.type === 'danger' ? 'Ignore & Trade Anyway' : 'Confirm Trade'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            </div>
        )}

        <Portfolio user={user} />
        {/* --- TRADE HISTORY --- */}
        <TradeHistory user={user} />

      </div>
    </div>
  );
}

export default Dashboard;