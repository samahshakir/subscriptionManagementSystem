import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, FileText, Power } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { fetchSubscriptions } from '../services/api'; // Import the fetchSubscriptions function
import StatCard from './StatCard';

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalMonthly: 0,
    totalAnnual: 0,
    activeSubscriptions: 0,
    totalSubscriptions: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    averageMonthly: 0,
    averageAnnual: 0,
    expiringSoon: [],
    longestActive: null,
    categoryBreakdown: [],
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
        const data = await fetchSubscriptions();
        setSubscriptions(data);

        // Calculate statistics
        const monthly = data.filter(sub => sub.billingFrequency === 'monthly');
        const annual = data.filter(sub => sub.billingFrequency === 'annually');
        const paid = data.filter(sub => sub.isActive === 'paid');
        const unpaid = data.filter(sub => sub.isActive === 'unpaid');
        const expiringSoon = data.filter(sub =>
          new Date(sub.renewalDate) <= new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        );
        const longestActive = data.reduce((longest, sub) =>
          new Date(sub.startDate) < new Date(longest?.startDate || Infinity) ? sub : longest,
          null
        );
        const categoryBreakdown = Object.entries(
          data.reduce((acc, sub) => {
            acc[sub.category] = acc[sub.category] || { count: 0, cost: 0 };
            acc[sub.category].count += 1;
            acc[sub.category].cost += sub.cost;
            return acc;
          }, {})
        );

        setStats({
          totalMonthly: monthly.reduce((sum, sub) => sum + sub.cost, 0),
          totalAnnual: annual.reduce((sum, sub) => sum + sub.cost, 0),
          activeSubscriptions: data.filter(sub => sub.isActive).length,
          totalSubscriptions: data.length,
          totalPaid: paid.reduce((sum, sub) => sum + sub.cost, 0),
          totalUnpaid: unpaid.reduce((sum, sub) => sum + sub.cost, 0),
          averageMonthly: monthly.length ? monthly.reduce((sum, sub) => sum + sub.cost, 0) / monthly.length : 0,
          averageAnnual: annual.length ? annual.reduce((sum, sub) => sum + sub.cost, 0) / annual.length : 0,
          expiringSoon,
          longestActive,
          categoryBreakdown,
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 space-y-4 sm:space-y-0">
        <h1 className="text-4xl font-bold text-gray-800">Subscription Dashboard</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
       {/* Statistics Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Monthly Subscriptions" 
          value={`$${stats.totalMonthly.toFixed(2)}`} 
          description="Total Monthly Costs" 
          color="text-blue-600"
        />
        
        <StatCard 
          title="Annual Subscriptions" 
          value={`$${stats.totalAnnual.toFixed(2)}`} 
          description="Total Annual Costs" 
          color="text-green-600"
        />
        
        <StatCard 
          title="Active Subscriptions" 
          value={stats.activeSubscriptions} 
          description="Currently Active" 
          color="text-purple-600"
        />
      </div>

      {/* Subscription Cost Overview */}
      <div className="mb-12">
        <div className="flex items-center justify-center mb-6">
          <h3 className="text-lg font-bold">Subscription Cost Overview</h3>
        </div>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={400} >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"/>
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Cost" fill="#8884d8" barSize={80} />
              <Bar dataKey="Paid" fill="#4caf50" barSize={80} />
              <Bar dataKey="Unpaid" fill="#f44336" barSize={80} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Subscriptions</h3>
          <Link 
            to="/subscriptions" 
            className="text-blue-500 hover:underline text-sm"
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
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Category</th>
                  <th className="text-left py-3">Cost</th>
                  <th className="text-left py-3">Renewal Date</th>
                  <th className="text-center py-3">Actions</th>
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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          title="Average Monthly Cost" 
          value={`$${stats.averageMonthly.toFixed(2)}`} 
          description="Average per Month" 
          color="text-teal-600"
        />

        <StatCard 
          title="Average Annual Cost" 
          value={`$${stats.averageAnnual.toFixed(2)}`} 
          description="Average per Year" 
          color="text-teal-600"
        />

        <StatCard 
          title="Average Total" 
          value={`${
            subscriptions.length > 0 
              ? (subscriptions.reduce((sum, sub) => sum + sub.cost, 0) / subscriptions.length).toFixed(2) 
              : 0
          }`} 
          description="Total Average of Month and Annual" 
          color="text-orange-600"
        />

        <StatCard 
          title="Total Subscriptions" 
          value={stats.totalSubscriptions} 
          description="" 
          color="text-indigo-600"
        />

        <StatCard 
          title="Expiring Soon" 
          value={`${stats.expiringSoon.length} subscriptions`} 
          description="" 
          color="text-red-600"
        />
      </div>

     <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <div className="flex items-center justify-between mb-4">
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

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-12">
        <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
        <ul>
          {stats.categoryBreakdown.map(([category, { count, cost }]) => (
            <li key={category} className="flex justify-between py-1">
              <span>{category.replace('_', ' ')}</span>
              <span className="text-gray-600">
                {count} subscriptions - ${cost.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Subscription Insights */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
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
            <p>
              <span className="font-semibold">Longest Active Subscription:</span>{' '}
              {stats.longestActive ? stats.longestActive.name : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;