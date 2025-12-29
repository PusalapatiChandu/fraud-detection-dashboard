"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Sample transaction data for demo
const SAMPLE_TRANSACTIONS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    amount: 75000,
    account: "ACC001",
    aadhaar: "1234567890",
    date: "2024-01-15",
    riskScore: 92,
    scheme: "PMJDY",
    flags: ["Amount unusually high", "Duplicate Aadhaar detected"],
  },
  {
    id: 2,
    name: "Priya Singh",
    amount: 15000,
    account: "ACC002",
    aadhaar: "9876543210",
    date: "2024-01-14",
    riskScore: 15,
    scheme: "PM-KISAN",
    flags: [],
  },
  {
    id: 3,
    name: "Amit Patel",
    amount: 85000,
    account: "ACC001",
    aadhaar: "5555555555",
    date: "2024-01-13",
    riskScore: 88,
    scheme: "NREGA",
    flags: ["Same account used 5 times today", "High frequency claims"],
  },
  {
    id: 4,
    name: "Neha Desai",
    amount: 22000,
    account: "ACC004",
    aadhaar: "1111111111",
    date: "2024-01-12",
    riskScore: 32,
    scheme: "PMJDY",
    flags: ["Medium risk pattern"],
  },
  {
    id: 5,
    name: "Vikram Rao",
    amount: 95000,
    account: "ACC005",
    aadhaar: "2222222222",
    date: "2024-01-11",
    riskScore: 78,
    scheme: "PM-KISAN",
    flags: ["Duplicate bank account", "Multiple claims across schemes"],
  },
  {
    id: 6,
    name: "Anjali Verma",
    amount: 18000,
    account: "ACC006",
    aadhaar: "3333333333",
    date: "2024-01-10",
    riskScore: 12,
    scheme: "NREGA",
    flags: [],
  },
  {
    id: 7,
    name: "Suresh Gupta",
    amount: 65000,
    account: "ACC007",
    aadhaar: "4444444444",
    date: "2024-01-09",
    riskScore: 71,
    scheme: "PMJDY",
    flags: ["Unusual transaction pattern", "High amount for region"],
  },
]

// Analytics data
const REGION_DATA = [
  { region: "UP", fraudCount: 45, transactions: 320 },
  { region: "MP", fraudCount: 32, transactions: 280 },
  { region: "Bihar", fraudCount: 38, transactions: 250 },
  { region: "Rajasthan", fraudCount: 28, transactions: 290 },
  { region: "Gujarat", fraudCount: 22, transactions: 310 },
]

const TREND_DATA = [
  { date: "Jan 1", frauds: 12, total: 156 },
  { date: "Jan 5", frauds: 18, total: 198 },
  { date: "Jan 10", frauds: 15, total: 187 },
  { date: "Jan 15", frauds: 28, total: 245 },
  { date: "Jan 20", frauds: 35, total: 302 },
  { date: "Jan 25", frauds: 42, total: 356 },
]

const SCHEME_DATA = [
  { name: "PMJDY", value: 35 },
  { name: "PM-KISAN", value: 28 },
  { name: "NREGA", value: 22 },
  { name: "Others", value: 15 },
]

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16"]

function getRiskBadge(score: number) {
  if (score >= 70) return { label: "Critical", color: "bg-red-100 text-red-800", icon: "🔴" }
  if (score >= 40) return { label: "Medium", color: "bg-yellow-100 text-yellow-800", icon: "🟡" }
  return { label: "Low", color: "bg-green-100 text-green-800", icon: "🟢" }
}

export default function FraudDashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof SAMPLE_TRANSACTIONS)[0] | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState(SAMPLE_TRANSACTIONS)

  const highRiskCount = filteredTransactions.filter((t) => t.riskScore >= 70).length
  const mediumRiskCount = filteredTransactions.filter((t) => t.riskScore >= 40 && t.riskScore < 70).length
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">FraudWatch AI</h1>
          <p className="text-slate-600">Real-time fraud detection for government transaction schemes</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</div>
              <p className="text-xs text-slate-500 mt-1">Analyzed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-slate-600">High Risk</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
              <p className="text-xs text-slate-500 mt-1">
                {((highRiskCount / filteredTransactions.length) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Medium Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</div>
              <p className="text-xs text-slate-500 mt-1">Requires verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">₹{(totalAmount / 100000).toFixed(1)}L</div>
              <p className="text-xs text-slate-500 mt-1">Under review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="explainability">AI Insights</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suspicious Transactions (High to Medium Risk)</CardTitle>
                <CardDescription>Transactions flagged by hybrid AI model (Rules + ML)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Scheme</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Risk Score</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions
                        .filter((t) => t.riskScore >= 40)
                        .sort((a, b) => b.riskScore - a.riskScore)
                        .map((transaction) => {
                          const risk = getRiskBadge(transaction.riskScore)
                          return (
                            <tr key={transaction.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4 font-medium text-slate-900">{transaction.name}</td>
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                ₹{transaction.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-700">{transaction.scheme}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 bg-slate-200 rounded-full h-2 relative">
                                    <div
                                      className={`h-full rounded-full ${transaction.riskScore >= 70 ? "bg-red-500" : "bg-yellow-500"}`}
                                      style={{ width: `${transaction.riskScore}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-slate-900">{transaction.riskScore}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={risk.color}>
                                  {risk.icon} {risk.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTransaction(transaction)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Explain
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Explainability Modal */}
            {selectedTransaction && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Why is {selectedTransaction.name}&apos;s transaction flagged?</CardTitle>
                      <CardDescription>
                        Risk Score: {selectedTransaction.riskScore}/100 -{" "}
                        {getRiskBadge(selectedTransaction.riskScore).label}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(null)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    {selectedTransaction.flags.length > 0 ? (
                      <>
                        <h4 className="font-semibold text-slate-900">Detected Anomalies:</h4>
                        {selectedTransaction.flags.map((flag, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-slate-900">{flag}</p>
                              <p className="text-sm text-slate-600 mt-1">
                                {flag.includes("high") &&
                                  "Amount ₹" + selectedTransaction.amount + " exceeds region average by 3x"}
                                {flag.includes("Duplicate Aadhaar") &&
                                  "Aadhaar " + selectedTransaction.aadhaar + " found in 3 different accounts"}
                                {flag.includes("Same account") &&
                                  "Account " + selectedTransaction.account + " processed 5 claims in single day"}
                                {flag.includes("frequency") && "Temporal pattern indicates benefit fraud ring"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-slate-600">No major anomalies detected for this transaction.</p>
                    )}
                  </div>

                  <div className="bg-slate-100 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Transaction Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-600">Beneficiary</p>
                        <p className="font-medium text-slate-900">{selectedTransaction.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Amount</p>
                        <p className="font-medium text-slate-900">₹{selectedTransaction.amount}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Bank Account</p>
                        <p className="font-medium text-slate-900">{selectedTransaction.account}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Aadhaar</p>
                        <p className="font-medium text-slate-900">****{selectedTransaction.aadhaar.slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Trend Over Time</CardTitle>
                  <CardDescription>Daily fraud detections vs total transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      frauds: { label: "Fraud Cases", color: "hsl(0, 84%, 60%)" },
                      total: { label: "Total", color: "hsl(200, 100%, 50%)" },
                    }}
                    className="h-72"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={TREND_DATA}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="frauds" stroke="var(--color-frauds)" strokeWidth={2} />
                        <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fraud by Region</CardTitle>
                  <CardDescription>Regional distribution of detected fraud</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      fraudCount: { label: "Fraud Count", color: "hsl(0, 84%, 60%)" },
                    }}
                    className="h-72"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={REGION_DATA}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="fraudCount" fill="var(--color-fraudCount)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fraud by Scheme</CardTitle>
                  <CardDescription>Which schemes are most targeted</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SCHEME_DATA}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} (${value})`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {SCHEME_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="explainability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>How FraudWatch AI Works</CardTitle>
                <CardDescription>Hybrid approach combining rules and machine learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This system uses a hybrid AI approach: Rule-based detection (60%) catches known fraud patterns,
                    while ML anomaly detection (40%) catches unknown frauds. Results are transparent and explainable for
                    government use.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-slate-900">Rule-Based Detection (60%)</h3>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>✓ Duplicate Aadhaar / Bank Account</li>
                      <li>✓ Multiple claims same scheme</li>
                      <li>✓ Unusual transaction amounts</li>
                      <li>✓ High-frequency claims</li>
                      <li>✓ Cross-scheme fraud rings</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-slate-900">ML Anomaly Detection (40%)</h3>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>✓ Isolation Forest algorithm</li>
                      <li>✓ Unusual patterns in features</li>
                      <li>✓ Deviation from historical norms</li>
                      <li>✓ Complex fraud schemes</li>
                      <li>✓ Self-learning on feedback</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h3 className="font-bold text-slate-900">Why This Matters</h3>
                  <p className="text-sm text-slate-700">
                    Government spending on social schemes is estimated at ₹10,000+ crores annually. Fraud detection
                    saves money AND builds public trust. Unlike black-box AI, FraudWatch explains WHY each transaction
                    is flagged—making decisions transparent and defensible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
