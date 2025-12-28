import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

function TradeHistory({ user }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchTrades();
  }, [user]);

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/trades/${user.id}`);
      setTrades(res.data);
    } catch (err) {
      console.error("Failed to load trades", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-500">Loading History...</div>;

  return (
    <div className="w-full max-w-4xl mt-8 animate-fade-in-up">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="text-blue-400" /> Trade History
      </h3>

      {trades.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No trades yet. Start trading to see data here!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700 shadow-2xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-900/50">
              {trades.map((trade) => (
                <tr key={trade._id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {new Date(trade.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                        trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                        {trade.type === 'BUY' ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                        {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">₹{trade.price.toLocaleString()}</td>
                  <td className="px-6 py-4">{trade.quantity}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-blue-300">
                    ₹{trade.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TradeHistory;