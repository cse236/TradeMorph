const TradeTable = () => {
  const sampleTrades = [
    { symbol: "AAPL", qty: 10, buy: 150, sell: 155, profit: "3.3%" },
    { symbol: "TSLA", qty: 5, buy: 700, sell: 650, profit: "-7.1%" }
  ];

  return (
    <table border="1" cellPadding="8" style={{ marginTop: "20px", marginLeft: "auto", marginRight: "auto" }}>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Qty</th>
          <th>Buy Price</th>
          <th>Sell Price</th>
          <th>Profit %</th>
        </tr>
      </thead>
      <tbody>
        {sampleTrades.map((trade, index) => (
          <tr key={index}>
            <td>{trade.symbol}</td>
            <td>{trade.qty}</td>
            <td>{trade.buy}</td>
            <td>{trade.sell}</td>
            <td>{trade.profit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TradeTable;
