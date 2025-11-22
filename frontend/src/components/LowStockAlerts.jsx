import React, { useState, useEffect } from "react";
import axios from "axios";

const LowStockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products/low-stock");
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching low stock alerts:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-4">Loading alerts...</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Low Stock Alerts
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Products that are running low on stock.
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <li className="px-4 py-4 sm:px-6">
            <p className="text-sm text-gray-500">
              No low stock alerts at this time.
            </p>
          </li>
        ) : (
          alerts.map((product) => (
            <li key={product.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">{product.description}</p>
                  <p className="text-sm text-gray-500">
                    Shop: {product.Shop?.name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-900">${product.price}</div>
                  <div className="text-sm text-red-600 font-medium">
                    Qty: {product.quantity} / {product.lowStockThreshold}
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default LowStockAlerts;
