import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: "",
    lowStock: false,
  });
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchProducts = useCallback(async () => {
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page);
      params.append("limit", filters.limit);
      params.append("lowStock", filters.lowStock);
      if (category) params.append("category", category);
      const response = await axios.get(`/api/products?${params}`, {
        signal: abortControllerRef.current.signal,
      });
      if (isMountedRef.current) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
    
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching products:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [category, filters.page, filters.limit, filters.lowStock]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchProducts();
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${productId}`);
        fetchProducts(); 
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Product Inventory
          </h3>
          <p className="text-gray-600 mt-1">Manage and track your products</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <label className="flex items-center bg-white px-4 py-2 rounded-xl border border-gray-300 cursor-pointer hover:border-indigo-300 transition-all duration-200">
            <input
              type="checkbox"
              checked={filters.lowStock}
              onChange={(e) =>
                handleFilterChange({ lowStock: e.target.checked })
              }
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Low stock only
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={`product-${product.id}`}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        product.quantity <= product.lowStockThreshold
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {product.name}
                    </h4>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {product.category || "No category"}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {product.Shop?.name || "No shop"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-2xl font-bold text-indigo-600">
                    ${product.price}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.quantity <= product.lowStockThreshold
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {product.quantity} in stock
                  </div>
                  {product.quantity <= product.lowStockThreshold && (
                    <div className="text-xs text-red-600 font-medium">
                      Below threshold ({product.lowStockThreshold})
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new product.
          </p>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-semibold">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-semibold">{pagination.total}</span>{" "}
              results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      page === pagination.page
                        ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
