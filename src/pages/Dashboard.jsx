// src/pages/Dashboard.jsx
import { useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  FaShoppingCart,
  FaRupeeSign,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaSyncAlt,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// ---------- helpers ----------
const fmtNum = (n) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : n ?? "-";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : n ?? "-";

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "-");

// dummy base trends (10 din ka sample)
const BASE_TREND = [
  { date: "2025-01-01", orders: 120, revenue: 85000 },
  { date: "2025-01-02", orders: 95, revenue: 68000 },
  { date: "2025-01-03", orders: 140, revenue: 102000 },
  { date: "2025-01-04", orders: 160, revenue: 115000 },
  { date: "2025-01-05", orders: 110, revenue: 79000 },
  { date: "2025-01-06", orders: 180, revenue: 130000 },
  { date: "2025-01-07", orders: 150, revenue: 99000 },
  { date: "2025-01-08", orders: 170, revenue: 121000 },
  { date: "2025-01-09", orders: 190, revenue: 145000 },
  { date: "2025-01-10", orders: 210, revenue: 158000 },
];

const DUMMY_PRODUCTS = [
  {
    productId: "p1",
    name: "Wireless Earbuds",
    sku: "EARBUDS-001",
    category: "Electronics",
    unitsSold: 1240,
    revenue: 930000,
    lastOrderAt: "2025-01-10",
  },
  {
    productId: "p2",
    name: "Running Shoes",
    sku: "SHOES-023",
    category: "Footwear",
    unitsSold: 780,
    revenue: 546000,
    lastOrderAt: "2025-01-09",
  },
  {
    productId: "p3",
    name: "Smart Watch",
    sku: "WATCH-010",
    category: "Wearables",
    unitsSold: 560,
    revenue: 672000,
    lastOrderAt: "2025-01-08",
  },
  {
    productId: "p4",
    name: "Cotton T-Shirt",
    sku: "TSHIRT-112",
    category: "Apparel",
    unitsSold: 980,
    revenue: 294000,
    lastOrderAt: "2025-01-07",
  },
];

const DUMMY_CUSTOMERS = [
  {
    customerId: "c1",
    name: "Amit Sharma",
    email: "amit.sharma@example.com",
    orders: 18,
    totalSpent: 145000,
    lastOrderAt: "2025-01-10",
  },
  {
    customerId: "c2",
    name: "Priya Verma",
    email: "priya.verma@example.com",
    orders: 12,
    totalSpent: 98000,
    lastOrderAt: "2025-01-09",
  },
  {
    customerId: "c3",
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    orders: 9,
    totalSpent: 72000,
    lastOrderAt: "2025-01-08",
  },
  {
    customerId: "c4",
    name: "Sneha Gupta",
    email: "sneha.gupta@example.com",
    orders: 7,
    totalSpent: 56000,
    lastOrderAt: "2025-01-07",
  },
];

const DUMMY_CATEGORY_PERF = [
  { category: "Electronics", orders: 420 },
  { category: "Footwear", orders: 310 },
  { category: "Apparel", orders: 520 },
  { category: "Home & Kitchen", orders: 260 },
  { category: "Accessories", orders: 190 },
];

// range ke hisaab se kitne points dikhane hain
const RANGE_POINTS = {
  "7d": 7,
  "30d": 10,
  "90d": 10,
  "180d": 10,
};

// dummy data builder
const getDummyDashboardData = (range) => {
  const points = RANGE_POINTS[range] || 10;
  const trend = BASE_TREND.slice(-points);

  const totalOrders = trend.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = trend.reduce((sum, d) => sum + d.revenue, 0);
  const today = trend[trend.length - 1];

  return {
    summary: {
      orders: {
        total: totalOrders,
        today: today.orders,
        pending: 86,
        shipped: 420,
      },
      revenue: {
        total: totalRevenue,
        today: today.revenue,
      },
      customers: {
        total: 7850,
        newToday: 34,
        repeat: 2150,
      },
      products: {
        total: 1250,
        inStock: 980,
        lowStock: 120,
      },
    },
    ordersTrend: trend.map((d) => ({
      date: fmtDate(d.date),
      orders: d.orders,
    })),
    revenueTrend: trend.map((d) => ({
      date: fmtDate(d.date),
      revenue: d.revenue,
    })),
    topProducts: DUMMY_PRODUCTS,
    topCustomers: DUMMY_CUSTOMERS,
    categoryPerformance: DUMMY_CATEGORY_PERF,
  };
};

export default function Dashboard() {
  const { themeColors } = useTheme();
  const [range, setRange] = useState("30d");
  const [refreshKey, setRefreshKey] = useState(0); // sirf Refresh button ka feel dene ke liye

  const data = useMemo(
    () => getDummyDashboardData(range),
    [range, refreshKey]
  );

  const { summary, ordersTrend, revenueTrend, topProducts, topCustomers, categoryPerformance } =
    data;

  const summaryCards = [
    {
      title: "Total Orders",
      value: fmtNum(summary.orders.total),
      icon: FaShoppingCart,
      description: `Today: ${fmtNum(summary.orders.today)} • Pending: ${fmtNum(
        summary.orders.pending
      )}`,
    },
    {
      title: "Revenue",
      value: fmtCurrency(summary.revenue.total),
      icon: FaRupeeSign,
      description: `Today: ${fmtCurrency(summary.revenue.today)}`,
    },
    {
      title: "Customers",
      value: fmtNum(summary.customers.total),
      icon: FaUsers,
      description: `New today: ${fmtNum(
        summary.customers.newToday
      )} • Repeat: ${fmtNum(summary.customers.repeat)}`,
    },
    {
      title: "Products",
      value: fmtNum(summary.products.total),
      icon: FaBoxOpen,
      description: `In stock: ${fmtNum(
        summary.products.inStock
      )} • Low stock: ${fmtNum(summary.products.lowStock)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: themeColors.text }}
          >
            E-commerce Overview
          </h1>
          <p
            className="text-sm mt-1 opacity-75"
            style={{ color: themeColors.text }}
          >
            Orders, revenue, customers, and product performance at a glance
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="180d">Last 180 days</option>
          </select>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-3 py-2 rounded-lg border text-sm flex items-center gap-2"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
            title="Refresh dummy data"
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg group"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p
                  className="text-sm font-medium mb-1 opacity-75"
                  style={{ color: themeColors.text }}
                >
                  {stat.title}
                </p>
                <p
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.primary }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs opacity-60"
                  style={{ color: themeColors.text }}
                >
                  {stat.description}
                </p>
              </div>
              <div
                className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: themeColors.primary + "15" }}
              >
                <stat.icon
                  className="text-lg"
                  style={{ color: themeColors.primary }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Orders & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders per day */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4 flex items-center justify-between"
            style={{ color: themeColors.text }}
          >
            <span className="flex items-center gap-2">
              <FaChartBar />
              Orders per Day
            </span>
            <span className="text-xs opacity-70">
              Today: {fmtNum(summary.orders.today)} • Total:{" "}
              {fmtNum(summary.orders.total)}
            </span>
          </h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={ordersTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue per day */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4 flex items-center justify-between"
            style={{ color: themeColors.text }}
          >
            <span className="flex items-center gap-2">
              <FaChartBar />
              Revenue per Day
            </span>
            <span className="text-xs opacity-70">
              Today: {fmtCurrency(summary.revenue.today)} • Total:{" "}
              {fmtCurrency(summary.revenue.total)}
            </span>
          </h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  tickFormatter={(v) =>
                    `₹${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value) => fmtCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Orders by category */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: themeColors.text }}
        >
          <FaChartBar />
          Orders by Category
        </h2>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables: Top products & Top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products table */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: themeColors.text }}
          >
            <FaBoxOpen />
            Top Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: themeColors.background + "30",
                  }}
                >
                  {[
                    "Product",
                    "SKU",
                    "Category",
                    "Units Sold",
                    "Revenue",
                    "Last Order",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: themeColors.text }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: themeColors.border }}
              >
                {topProducts.map((p) => (
                  <tr key={p.productId}>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {p.name}
                    </td>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {p.sku}
                    </td>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {p.category}
                    </td>
                    <td
                      className="px-4 py-2 font-semibold"
                      style={{ color: themeColors.primary }}
                    >
                      {fmtNum(p.unitsSold)}
                    </td>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {fmtCurrency(p.revenue)}
                    </td>
                    <td
                      className="px-4 py-2 text-xs opacity-70"
                      style={{ color: themeColors.text }}
                    >
                      {fmtDate(p.lastOrderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top customers table */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: themeColors.text }}
          >
            <FaUsers />
            Top Customers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: themeColors.background + "30",
                  }}
                >
                  {[
                    "Customer",
                    "Email",
                    "Orders",
                    "Total Spent",
                    "Last Order",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: themeColors.text }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: themeColors.border }}
              >
                {topCustomers.map((c) => (
                  <tr key={c.customerId}>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {c.name}
                    </td>
                    <td
                      className="px-4 py-2 text-xs"
                      style={{ color: themeColors.text }}
                    >
                      {c.email}
                    </td>
                    <td
                      className="px-4 py-2 font-semibold"
                      style={{ color: themeColors.primary }}
                    >
                      {fmtNum(c.orders)}
                    </td>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {fmtCurrency(c.totalSpent)}
                    </td>
                    <td
                      className="px-4 py-2 text-xs opacity-70"
                      style={{ color: themeColors.text }}
                    >
                      {fmtDate(c.lastOrderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
