"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"

interface CryptoDataPoint {
  date: string
  price: number
  market_cap: number
  total_volume: number
}

interface CryptoChartProps {
  data: CryptoDataPoint[]
  title?: string
  description?: string
}

export default function CryptoChart({
  data,
  title = "Bitcoin Price Chart",
  description = "Historical price data",
}: CryptoChartProps) {
  const [activeTab, setActiveTab] = useState("price")

  // Sort data by date in ascending order
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Format data for the chart
  const formattedData = sortedData.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    price: item.price,
    market_cap: item.market_cap / 1000000000, // Convert to billions
    total_volume: item.total_volume / 1000000000, // Convert to billions
  }))

  // Format functions for different data types
  const formatPrice = (value: number) => `$${value.toLocaleString()}`
  const formatBillions = (value: number) => `$${value.toFixed(2)}B`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="price" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="market_cap">Market Cap</TabsTrigger>
            <TabsTrigger value="total_volume">Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="price">
            <ChartContainer
              config={{
                price: {
                  label: "Price (USD)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent formatters={{ price: formatPrice }} />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color-price)"
                    name="Price (USD)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="market_cap">
            <ChartContainer
              config={{
                market_cap: {
                  label: "Market Cap (Billions USD)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}B`} />
                  <ChartTooltip content={<ChartTooltipContent formatters={{ market_cap: formatBillions }} />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="market_cap"
                    stroke="var(--color-market_cap)"
                    name="Market Cap (Billions USD)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="total_volume">
            <ChartContainer
              config={{
                total_volume: {
                  label: "Trading Volume (Billions USD)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}B`} />
                  <ChartTooltip content={<ChartTooltipContent formatters={{ total_volume: formatBillions }} />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_volume"
                    stroke="var(--color-total_volume)"
                    name="Trading Volume (Billions USD)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

