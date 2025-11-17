"use client"

import CryptoChart from "../features/chats/components/crypto-chart"

// Sample data
const sampleData = [
  {
    date: "2025-03-09",
    price: 66000,
    market_cap: 1300000000000,
    total_volume: 34000000000,
  },
  {
    date: "2025-03-08",
    price: 64500,
    market_cap: 1280000000000,
    total_volume: 32000000000,
  },
  {
    date: "2025-03-07",
    price: 65000,
    market_cap: 1290000000000,
    total_volume: 33000000000,
  },
]

export default function TestChart() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Chart</h1>
      <CryptoChart data={sampleData} title="Bitcoin Test Data" description="Sample cryptocurrency data for testing" />
    </div>
  )
}

