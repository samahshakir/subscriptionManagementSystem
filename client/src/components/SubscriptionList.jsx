// src/SubscriptionList.js

import { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit, FileText, ArrowUp, ArrowDown,CircleCheck,CircleX, LayoutGrid, Table } from 'lucide-react';
import { fetchSubscriptions,deleteSubscription,handleUpdateStatus } from '../services/api'; // Import the fetchSubscriptions function
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';


const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTableView, setIsTableView] = useState(true);

  const toggleView = () => {
    setIsTableView(prev => !prev);
  };

  
  // Filtering and Sorting States
  const [filter, setFilter] = useState({
    category: 'all',
    billingFrequency: 'all',
    isActive: 'all',
    searchTerm: '',
    startDate: '',
    renewalDate: '' 
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  // Fetch subscriptions on component mount
  useEffect(() => {
    const fetchSubscriptionsData = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscriptions(); // Use the fetchSubscriptions function
        setSubscriptions(data);
        setLoading(false);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to fetch subscriptions');
        setLoading(false);
      }
    };

    fetchSubscriptionsData();
  }, []);

  // Filtered and Sorted Subscriptions
  const processedSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // Filtering
    if (filter.category !== 'all') {
      result = result.filter(sub => sub.category === filter.category);
    }

    if (filter.billingFrequency !== 'all') {
      result = result.filter(sub => sub.billingFrequency === filter.billingFrequency);
    }

    if (filter.isActive !== 'all') {
      result = result.filter(sub => sub.isActive === filter.isActive);
    }


    if (filter.searchTerm) {
      result = result.filter(sub => 
        sub.name.toLowerCase().includes(filter.searchTerm.toLowerCase())
      );
    }


  // Filtering by start date
  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    result = result.filter(sub => new Date(sub.startDate) >= startDate);
  }

  // Filtering by renewal date
  if (filter.renewalDate) {
    const renewalDate = new Date(filter.renewalDate);
    result = result.filter(sub => new Date(sub.renewalDate) <= renewalDate);
  }

    

    // Sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'renewalDate') {
        const dateA = new Date(a.renewalDate);
        const dateB = new Date(b.renewalDate);
        if (dateA < dateB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }

      if (sortConfig.key === 'startDate') {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        if (dateA < dateB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [subscriptions, filter, sortConfig]);

  // Handle Sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  // Handle Subscription Deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        // Call the API function to delete the subscription
        await deleteSubscription(id);
  
        // Update the UI
        setSubscriptions((prev) => prev.filter((sub) => sub._id !== id));
      } catch (err) {
        console.error('Error deleting subscription:', err);
        setError('Failed to delete subscription');
      }
    }
  };

  // Handle Invoice Download
  const handleDownloadInvoice = (invoiceUrl) => {
    const fullUrl = `https://localhost:5000${invoiceUrl}`; // Prepend the server URL
    window.open(fullUrl, '_blank'); // Open the correct URL
  };

  // Handle Payment Status 
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      // Calculate the updated status
      const updatedStatus = currentStatus === "paid" ? "unpaid" : "paid";
  
      // Call the backend to update the status
      const success = await handleUpdateStatus(id, updatedStatus);
  
      if (success) {
        // Optional: Add local state management if needed for instant UI updates
        console.log(`Subscription ${id} status updated to ${updatedStatus}`);
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.map((sub) =>
            sub._id === id ? { ...sub, isActive: updatedStatus } : sub
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle subscription status:", error);
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Name', 'Category', 'Cost', 'Billing', 'Pay Status', 'Start Date', 'Renewal Date'],
      ...processedSubscriptions.map(sub => [
        sub.name,
        sub.category.replace('_', ' '),
        sub.cost.toFixed(2),
        sub.billingFrequency,
        sub.isActive ? 'Active' : 'Inactive',
        new Date(sub.startDate).toLocaleDateString(),
        new Date(sub.renewalDate).toLocaleDateString()
      ])
    ];
  
    const csv = Papa.unparse(csvData, { header: false }); // Ensure 'unparse' is used here
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'subscriptions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the DOM
  };
// Function to export table as PDF
const exportToPDF = () => {
  const doc = new jsPDF();
  const columns = ['Name', 'Category', 'Cost', 'Billing', 'Pay Status', 'Start Date', 'Renewal Date'];
  const rows = processedSubscriptions.map(sub => [
    sub.name,
    sub.category.replace('_', ' '),
    sub.cost.toFixed(2),
    sub.billingFrequency,
    sub.isActive,
    new Date(sub.startDate).toLocaleDateString(),
    new Date(sub.renewalDate).toLocaleDateString()
  ]);

  doc.autoTable({
    head: [columns],
    body: rows
  });

  doc.save('subscriptions.pdf');
};
  

  // Render Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Subscriptions</h1>
  
      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Total Subscriptions</h3>
          <p className="text-2xl font-bold">{subscriptions.length}</p>
        </div>
  
        <div className="bg-green-100 shadow rounded-lg p-4">
          <h3 className="text-lg text-green-800 font-semibold mb-2">Total Paid</h3>
          <p className="text-2xl font-bold">
            ${subscriptions
              .filter(sub => sub.isActive === 'paid')
              .reduce((sum, sub) => sum + sub.cost, 0)
              .toFixed(2)}
          </p>
        </div>
  
        <div className="bg-red-100 shadow rounded-lg p-4">
          <h3 className="text-lg text-red-800 font-semibold mb-2">Total Unpaid</h3>
          <p className="text-2xl font-bold">
            ${subscriptions
              .filter(sub => sub.isActive === 'unpaid')
              .reduce((sum, sub) => sum + sub.cost, 0)
              .toFixed(2)}
          </p>
        </div>
  
        <div className="bg-gray-100 shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Total Subscriptions Cost</h3>
          <p className="text-2xl font-bold">
            $
            {subscriptions
              .reduce((sum, sub) => sum + sub.cost, 0)
              .toFixed(2)}
          </p>
        </div>
  
        <div className="bg-yellow-100 shadow rounded-lg p-4">
          <h3 className="text-lg text-yellow-800 font-semibold mb-2">Unpaid Bills This Month</h3>
          <p className="text-2xl font-bold">
            {subscriptions.filter(sub => {
              if (sub.isActive !== 'unpaid') return false;
  
              const currentDate = new Date();
              const startDate = new Date(sub.startDate);
              const renewalDate = new Date(sub.renewalDate);
  
              // Check if the subscription is due this month
              const isThisMonth = 
                (startDate.getMonth() === currentDate.getMonth() &&
                startDate.getFullYear() === currentDate.getFullYear()) ||
                (renewalDate.getMonth() === currentDate.getMonth() &&
                renewalDate.getFullYear() === currentDate.getFullYear());
  
              return isThisMonth;
            }).length}
          </p>
          <p className="text-md text-gray-700 mt-2">
            Total Cost: $
            {subscriptions
              .filter(sub => {
                if (sub.isActive !== 'unpaid') return false;
  
                const currentDate = new Date();
                const startDate = new Date(sub.startDate);
                const renewalDate = new Date(sub.renewalDate);
  
                // Check if the subscription is due this month
                const isThisMonth = 
                  (startDate.getMonth() === currentDate.getMonth() &&
                  startDate.getFullYear() === currentDate.getFullYear()) ||
                  (renewalDate.getMonth() === currentDate.getMonth() &&
                  renewalDate.getFullYear() === currentDate.getFullYear());
  
                return isThisMonth;
              })
              .reduce((sum, sub) => sum + sub.cost, 0)
              .toFixed(2)}
          </p>
        </div>
  
        <div className="bg-blue-100 shadow rounded-lg p-4">
          <h3 className="text-lg text-blue-800 font-semibold mb-2">Bills to Be Paid in 3 days</h3>
          <p className="text-2xl font-bold">
            {subscriptions.filter(sub => {
              if (sub.isActive !== 'unpaid') return false;
  
              const currentDate = new Date();
              const renewalDate = new Date(sub.renewalDate);
  
              // Check if the renewal date is today or within the next 3 days
              const daysDifference = Math.ceil((renewalDate - currentDate) / (1000 * 60 * 60 * 24));
              return daysDifference >= 0 && daysDifference <= 3;
            }).length}
          </p>
          <p className="text-md text-gray-700 mt-2">
            Total Cost: $
            {subscriptions
              .filter(sub => {
                if (sub.isActive !== 'unpaid') return false;
  
                const currentDate = new Date();
                const renewalDate = new Date(sub.renewalDate);
  
                // Check if the renewal date is today or within the next 3 days
                const daysDifference = Math.ceil((renewalDate - currentDate) / (1000 * 60 * 60 * 24));
                return daysDifference >= 0 && daysDifference <= 3;
              })
              .reduce((sum, sub) => sum + sub.cost, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>
  
      {/* Filters */}
      <div className="mb-6 flex flex-wrap space-x-4">
        {/* Category Filter */}
        <select 
          value={filter.category}
          onChange={(e) => setFilter(prev => ({...prev, category: e.target.value}))}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Categories</option>
          <option value="cloud services">Cloud Services</option>
          <option value="marketing tools">Marketing Tools</option>
          <option value="streaming">Streaming</option>
          <option value="music">Music</option>
          <option value="other bills">Other Bills</option>
        </select>
  
        {/* Billing Frequency Filter */}
        <select 
          value={filter.billingFrequency}
          onChange={(e) => setFilter(prev => ({...prev, billingFrequency: e.target.value}))}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Frequencies</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
  
        {/* Payment Status Frequency Filter */}
        <select 
          value={filter.isActive}
          onChange={(e) => setFilter(prev => ({...prev, isActive: e.target.value}))}
          className="border rounded px-3 py-2"
        >
          <option value="all">Paid and Unpaid</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
  
        {/* Start Date Filter */}
        <div className="flex items-center space-x-2">
          <label className="font-medium">From Date:</label>
          <input 
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </div>
  
        {/* Renewal Date Filter */}
        <div className="flex items-center space-x-2">
          <label className="font-medium">To Date:</label>
          <input 
            type="date"
            value={filter.renewalDate}
            onChange={(e) => setFilter(prev => ({ ...prev, renewalDate: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </div>
  
        {/* Search Input */}
        <input 
          type="text"
          placeholder="Search subscriptions..."
          value={filter.searchTerm}
          onChange={(e) => setFilter(prev => ({...prev, searchTerm: e.target.value}))}
          className="border rounded px-3 py-2 flex-grow"
        />
  
        {/* Toggle Switch */}
        <button 
          onClick={toggleView}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label={isTableView ? 'Switch to card view' : 'Switch to table view'}
        >
          {isTableView ? (
            <LayoutGrid className="w-6 h-6 text-gray-600" />
          ) : (
            <Table className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>
  
      {/* Subscriptions Table */}
      {isTableView ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 flex items-center"
                  onClick={() => handleSort('name')}
                >
                  Name 
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'ascending' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 flex items-center"
                  onClick={() => handleSort('cost')}
                >
                  Cost
                  {sortConfig.key === 'cost' && (
                    sortConfig.direction === 'ascending' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Status</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center">
                    Start Date
                    {sortConfig.key === 'startDate' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('renewalDate')}
                >
                  <div className="flex items-center">
                    Renewal Date
                    {sortConfig.key === 'renewalDate' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedSubscriptions.map(subscription => (
                <tr 
                  key={subscription._id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{subscription.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                      {subscription.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${subscription.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs
                      ${subscription.billingFrequency === 'monthly' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-purple-100 text-purple-800'
                      }
                    `}>
                      {subscription.billingFrequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs
                      ${subscription.isActive === 'unpaid' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                      }
                    `}>
                      {subscription.isActive}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex justify-center space-x-2">
                    {/* Paid Check */}
                    <button
                      onClick={() => handleStatusToggle(subscription._id, subscription.isActive)} // Arrow function to pass arguments
                      className={`${
                        subscription.isActive === "paid" ? "text-green-600" : "text-red-600"
                      } hover:                    opacity-80`}
                    title={`Mark as ${subscription.isActive === "paid" ? "Unpaid" : "Paid"}`}
                  >
                    {subscription.isActive === "paid" ? (
                      <CircleCheck size={20} />
                    ) : (
                      <CircleX size={20} />
                    )}
                  </button>

                  {/* Invoice Download */}
                  {subscription.invoice && (
                    <button 
                      onClick={() => handleDownloadInvoice(subscription.invoice)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Download Invoice"
                    >
                      <FileText size={20} />
                    </button>
                  )}

                  {/* Edit Subscription */}
                  <Link to={`/update-subscriptions/${subscription._id}`}  
                    className="text-gray-700 hover:text-black"
                    title="Edit Subscription"
                  >
                    <Edit size={20} />
                  </Link>
                  
                  {/* Delete Subscription */}
                  <button 
                    onClick={() => handleDelete(subscription._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Subscription"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* No Subscriptions Message */}
        {processedSubscriptions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No subscriptions found. Add your first subscription!
          </div>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {processedSubscriptions.map(subscription => (
          <div key={subscription._id} className="bg-white shadow rounded-lg px-4 py-3">
            <h3 className="text-lg font-semibold mb-2">{subscription.name}</h3>
            <p className="text-gray-700 mb-2">
              <span className={`px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs mr-2`}>
                {subscription.category.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded text-xs mr-2
                ${subscription.billingFrequency === 'monthly' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-purple-100 text-purple-800'
                }
              `}>
                {subscription.billingFrequency}
              </span>
              <span className={`px-2 py-1 rounded text-xs
                ${subscription.isActive === 'unpaid' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
                }
              `}>
                {subscription.isActive}
              </span>
            </p>
            <p className="text-gray-700 mb-2">Cost: ${subscription.cost.toFixed(2)}</p>
            <p className="text-gray-700 mb-2">Start Date: {new Date(subscription.startDate).toLocaleDateString()}</p>
            <p className="text-gray-700 mb-2">Renewal Date: {new Date(subscription.renewalDate).toLocaleDateString()}</p>
            <div className="flex space-x-2">
              <div className="flex space-x-2">
                {/* Paid Check */}
                <button
                  onClick={() => handleStatusToggle(subscription._id, subscription.isActive)} // Arrow function to pass arguments
                  className={`${
                    subscription.isActive === "paid" ? "text-green-600" : "text-red-600"
                  } hover:opacity-80`}
                  title={`Mark as ${subscription.isActive === "paid" ? "Unpaid" : "Paid"}`}
                >
                  {subscription.isActive === "paid" ? (
                    <CircleCheck size={20} />
                  ) : (
                    <CircleX size={20} />
                  )}
                </button>

                {/* Invoice Download */}
                {subscription.invoice && (
                  <button 
                    onClick={() => handleDownloadInvoice(subscription.invoice)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Download Invoice"
                  >
                    <FileText size={20} />
                  </button>
                )}

                {/* Edit Subscription */}
                <Link to={`/update-subscriptions/${subscription._id}`}  
                  className="text-gray-700 hover:text-black"
                  title="Edit Subscription"
                >
                  <Edit size={20} />
                </Link>
                
                {/* Delete Subscription */}
                <button 
                  onClick={() => handleDelete(subscription._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Subscription"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="flex justify-end my-4">
      <button 
        onClick={exportToCSV}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300"
        aria-label="Export data as CSV"
      >
        Export as CSV
      </button>
      <button 
        onClick={exportToPDF}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring focus:border-green-300"
        aria-label="Export data as PDF"
      >
        Export as PDF
      </button>
    </div>
  </div>
);
}

export default SubscriptionList;