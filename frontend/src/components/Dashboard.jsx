import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import axios from "axios";
import ProductList from "./ProductList.jsx";
import ProductForm from "./ProductForm.jsx";
import LowStockAlerts from "./LowStockAlerts.jsx";
import UserForm from "./UserForm.jsx";
import TransactionList from "./TransactionList.jsx";
import TransactionForm from "./TransactionForm.jsx";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalProducts: 0,
    categoryTotals: null,
    lowStockCount: 0,
    totalTransactionValue: 0.0,
  });

  const [selectedCategory, setSelectedCategory] = useState("");

  const mainCategories = [
    "Electronics",
    "Household",
    "Clothing",
    "Books",
    "Sports",
    "Beauty",
    "Toys",
    "Automotive",
    "Health",
    "Food",
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const [categoryTotalsRes, lowStockRes, transactionValueRes] =
        await Promise.all([
          axios.get("/api/products/total-quantity", config),
          axios.get("/api/products/low-stock", config),
          axios.get("/api/transactions/total-value", config),
        ]);

      console.log("categoryTotalsRes.data:", categoryTotalsRes.data);

      const categoryTotals = {};
      for (const item of categoryTotalsRes.data.categoryTotals) {
        categoryTotals[item.category] = item.totalQuantity;
      }

      console.log("categoryTotals object:", categoryTotals);

      setStats({
        totalProducts: categoryTotalsRes.data.categoryTotals.reduce(
          (acc, curr) => acc + curr.totalQuantity,
          0
        ),
        categoryTotals: categoryTotals,
        lowStockCount: lowStockRes.data.length,
        totalTransactionValue: Number(transactionValueRes.data.totalValue) || 0,
      });

      console.log("Updated stats state:", {
        totalProducts: categoryTotalsRes.data.categoryTotals.reduce(
          (acc, curr) => acc + curr.totalQuantity,
          0
        ),
        categoryTotals: categoryTotals,
        lowStockCount: lowStockRes.data.length,
        totalTransactionValue: Number(transactionValueRes.data.totalValue) || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z",
    },
    {
      id: "products",
      label: "Products",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    {
      id: "add-product",
      label: "Add Product",
      icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      id: "add-transaction",
      label: "Add Transaction",
      icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
    },
    {
      id: "create-user",
      label: "Users",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
  ];

  const statCards = [
    {
      title: "Total Stock Quantity",
      value: stats.totalProducts,
      color: "blue",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      subtitle: stats.categoryTotals
        ? Object.entries(stats.categoryTotals).map(([category, qty]) => (
            <div key={category} className="text-xs text-gray-500">
              {category}: {qty}
            </div>
          ))
        : null,
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockCount,
      color: "red",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
    },
    {
      title: "Total Transaction Value",
      value: `$${stats.totalTransactionValue.toFixed(2)}`,
      color: "green",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
  ];

  const renderNavButton = (item) => (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center px-4 py-3 text-left rounded-xl font-medium text-sm transition-all duration-200 ${
        activeTab === item.id
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
          : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <svg
        className="w-5 h-5 mr-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={item.icon}
        />
      </svg>
      {item.label}
    </button>
  );

  const renderStatCard = (card, index) => {
    const colors = {
      blue: "from-blue-500 via-cyan-500 to-teal-500",
      red: "from-red-500 via-pink-500 to-rose-500",
      green: "from-green-500 via-emerald-500 to-teal-500",
    };

    return (
      <div
        key={index}
        className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 relative group"
      >
        <div className="relative p-6">
          <div className="flex items-center">
            <div
              className={`w-14 h-14 bg-gradient-to-br ${
                colors[card.color]
              } rounded-2xl flex items-center justify-center shadow-lg`}
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={card.icon}
                />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-semibold text-gray-700">
                {card.title}
              </dt>
              <dd className="text-3xl font-bold text-gray-900">{card.value}</dd>
            </div>
          </div>
          {card.subtitle && <div className="mt-2 ml-6">{card.subtitle}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-200">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-2xl border border-gray-300 rounded-3xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div>
          <div className="p-8 border-b border-indigo-300 flex flex-col items-center bg-gradient-to-b from-indigo-50 to-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              width="48"
              height="48"
              fill="none"
              stroke="#4338ca"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 drop-shadow-lg"
            >
              <rect
                x="10"
                y="20"
                width="44"
                height="28"
                rx="4"
                ry="4"
                fill="#6366f1"
                className="transition-all duration-300 hover:fill-indigo-400"
              />
              <polyline points="10,20 32,8 54,20" fill="#4f46e5" />
              <line x1="32" y1="8" x2="32" y2="48" stroke="#c7d2fe" />
              <line x1="20" y1="20" x2="20" y2="48" stroke="#c7d2fe" />
              <line x1="44" y1="20" x2="44" y2="48" stroke="#c7d2fe" />
            </svg>
            <h1 className="text-2xl font-extrabold text-indigo-700 mb-1 tracking-wide text-center">
              YOMEL Online Shopping
            </h1>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Inventory Manager
            </h2>
          </div>
          <nav className="p-6 space-y-3">{navItems.map(renderNavButton)}</nav>
          <div className="mt-10 px-6 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-wide">
              Categories
            </h3>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-indigo-400 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-300 appearance-none"
              >
                <option value="">All Categories</option>
                {mainCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-3 h-5 w-5 text-indigo-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Address: Bole S.C W-11, City: Addis Ababa, Country: Ethiopia</p>
        </footer>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-white shadow-lg border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTab === "products" ? "Products" : "Dashboard"}
                </h2>
                <div className="hidden md:flex items-center space-x-4 text-sm">
                  <span>Products: {stats.totalProducts}</span>
                  <span>Alerts: {stats.lowStockCount}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.email}
                      </p>
                      <p className="text-xs text-indigo-700 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 shadow-lg text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 p-8 overflow-auto">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {statCards.map((card, index) => renderStatCard(card, index))}
            </div>
          )}
          {activeTab === "products" && (
            <ProductList category={selectedCategory} />
          )}
          {activeTab === "add-product" && (
            <ProductForm onSuccess={fetchStats} />
          )}
          {activeTab === "transactions" && <TransactionList />}
          {activeTab === "add-transaction" && (
            <TransactionForm onSuccess={fetchStats} />
          )}
          {activeTab === "alerts" && <LowStockAlerts />}
          {activeTab === "create-user" && <UserForm />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
