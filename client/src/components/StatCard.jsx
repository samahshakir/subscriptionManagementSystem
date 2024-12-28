import React from 'react'

// eslint-disable-next-line react/prop-types
const StatCard = ({ title, value, description, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default StatCard