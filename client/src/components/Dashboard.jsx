import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, FileText, Power } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { fetchSubscriptions } from '../services/api'; // Import the fetchSubscriptions function

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalMonthly: 0,
    totalAnnual: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    localStorage.removeItem('authToken');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscriptions(); // Fetch subscriptions from the API
        setSubscriptions(data);

        // Calculate statistics
        const monthly = data.filter(sub => sub.billingFrequency === 'monthly');
        const annual = data.filter(sub => sub.billingFrequency === 'annually');
        const paid = data.filter(sub => sub.isActive === 'paid'); // Assume `isPaid` indicates if the subscription is paid
        const unpaid = data.filter(sub => sub.isActive === 'unpaid');

        setStats({
          totalMonthly: monthly.reduce((sum, sub) => sum + sub.cost, 0),
          totalAnnual: annual.reduce((sum, sub) => sum + sub.cost, 0),
          activeSubscriptions: data.filter(sub => sub.isActive).length,
          totalPaid: paid.reduce((sum, sub) => sum + sub.cost, 0),
          totalUnpaid: unpaid.reduce((sum, sub) => sum + sub.cost, 0)
        });

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch subscriptions', error);
        setError('Failed to load subscriptions');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const chartData = [
    { name: 'Monthly Costs', Cost: stats.totalMonthly },
    { name: 'Annual Costs', Cost: stats.totalAnnual },
    { name: 'Total Paid', Paid: stats.totalPaid },
    { name: 'Total Unpaid', Unpaid: stats.totalUnpaid }
  ];

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Subscription Dashboard</h1>
        <div className="flex space-x-4">
          <Link 
            to="/add-subscription" 
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <PlusCircle className="mr-2" /> Add Subscription
          </Link>
          <Link 
            to="/subscriptions" 
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <List className="mr-2" /> View All Subscriptions
          </Link>
          <Link
            to="/login"
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            onClick={() => {
              logout();
            }}
          >
            <Power className="mr-2" /> Logout
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="flex grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Monthly Subscriptions</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">${stats.totalMonthly.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Monthly Costs</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Annual Subscriptions</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">${stats.totalAnnual.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Annual Costs</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Active Subscriptions</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">{stats.activeSubscriptions}</p>
            <p className="text-sm text-gray-500">Currently Active</p>
          </div>
        </div>
      </div>

      <div className="mb-10 flex flex-col justify-center">
        <div className="flex items-center justify-center">
          <h3 className="text-lg font-bold mb-3">Subscription Cost Overview</h3>
        </div>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={400} >
            <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"/>
              <YAxis />
              <Tooltip />
              <Legend/>
              <Bar dataKey="Cost" fill="#8884d8" barSize={80}/>
              <Bar dataKey="Paid" fill="#4caf50" barSize={80}  /> 
              <Bar dataKey="Unpaid" fill="#f44336" barSize={80} /> 
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Recent Subscriptions</h3>
          <Link 
            to="/subscriptions" 
            className="text-blue-500 hover:underline text-sm ml-3 mt-1"
          >
            View All
          </Link>
        </div>
        <div>
          {subscriptions.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No subscriptions found. Add your first subscription!
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Cost</th>
                  <th className="text-left py-2">Renewal Date</th>
                  <th className="text-center py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 7).map(subscription => (
                  <tr 
                    key={subscription._id} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">{subscription.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                        {subscription.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">${subscription.cost.toFixed(2)}</td>
                    <td className="py-3">{new Date(subscription.renewalDate).toLocaleDateString()}</td>
                    <td className="text-center py-3">
                      {subscription.invoice && (
                        <button 
                          onClick={() => window.open(`https://localhost:5000${subscription.invoice}`, '_blank')}
                          className="text-blue-500 hover:text-blue-700"
                          title="View Invoice"
                        >
                          <FileText size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

     
      {/* Quick Actions */}
      <div className="flex grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="bg-white p-4 rounded-lg shadow-md">

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold underline underline-offset-8 decoration-gray-400 decoration-2">Export Subscriptions</h3>
          </div>
          <div className="flex items-center h-32">
            <div className="flex space-x-4 items-center">
              <button 
                onClick={() => console.log('Export CSV')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Export CSV
              </button>
              <button 
                onClick={() => console.log('Export PDF')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Upcoming Renewals</h3>
          </div>
          <div>
            {subscriptions
              .filter(sub => new Date(sub.renewalDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
              .slice(0, 3)
              .map(subscription => (
                <div 
                  key={subscription._id} 
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span>{subscription.name}</span>
                  <span className="text-sm text-red-500">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold underline underline-offset-8 decoration-gray-400 decoration-2">Subscription Insights</h3>
          </div>
          <div className="flex items-center h-32">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Highest Cost:</span>{' '}
                {subscriptions.length > 0 
                  ? `${subscriptions.reduce((max, sub) => 
                      sub.cost > max.cost ? sub : max
                    ).name} - $${subscriptions.reduce((max, sub) => 
                      sub.cost > max.cost ? sub : max
                    ).cost.toFixed(2)}`
                  : 'N/A'}
              </p>
              <p>
                <span className="font-semibold">Most Common Category:</span>{' '}
                {subscriptions.length > 0 
                  ? Object.entries(
                      subscriptions.reduce((acc, sub) => {
                        acc[sub.category] = (acc[sub.category] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[0][0].replace('_', ' ')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;