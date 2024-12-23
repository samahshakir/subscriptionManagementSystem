import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'streaming',
    cost: '',
    billingFrequency: 'monthly',
    startDate: '',
    renewalDate: '',
    isActive: 'unpaid',
    invoiceFile: null
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'cloud services', label: 'Cloud Services' },
    { value: 'music', label: 'Music' },
    { value: 'streaming', label: 'Streaming' },
    { value: 'marketing tools', label: 'Marketing Tools' },
    { value: 'Software', label: 'Software' },
    { value: 'other bills', label: 'Other Bills' }
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'invoice') {
      setFormData(prev => ({
        ...prev,
        invoice: files ? files[0] : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subscription name is required';
    }

    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Valid cost is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.renewalDate) {
      newErrors.renewalDate = 'Renewal date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {

       // Prepare form data for the request
       const formDataObj = new FormData();
       Object.keys(formData).forEach((key) => {
         if (key === 'invoice' && formData.invoice) {
           formDataObj.append('invoice', formData.invoice); // Match backend field
         } else {
           formDataObj.append(key, formData[key]);
         }
       });
  
        // Get the token from localStorage
        const authToken = localStorage.getItem('authToken');
        console.log("formData", formData)
        
        // TODO: Replace with actual API endpoint
        const response = await fetch('https://localhost:5000/api/subscriptions', {
          method: 'POST',
          body: formDataObj,
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '', // Send the token as Bearer if it exists
          },
        });
  
        if (response.ok) {
          navigate('/');
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit subscription');
      }
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Add New Subscription
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subscription Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Subscription Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } shadow-sm py-2 px-3`}
              placeholder="Enter subscription name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cost and Billing Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                Cost
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                className={`mt-1 block w-full rounded-md border ${
                  errors.cost ? 'border-red-500' : 'border-gray-300'
                } shadow-sm py-2 px-3`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-500">{errors.cost}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="billingFrequency" className="block text-sm font-medium text-gray-700">
                Billing Frequency
              </label>
              <select
                id="billingFrequency"
                name="billingFrequency"
                value={formData.billingFrequency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                } shadow-sm py-2 px-3`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700">
                Renewal Date
              </label>
              <input
                type="date"
                id="renewalDate"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.renewalDate ? 'border-red-500' : 'border-gray-300'
                } shadow-sm py-2 px-3`}
              />
              {errors.renewalDate && (
                <p className="mt-1 text-sm text-red-500">{errors.renewalDate}</p>
              )}
            </div>
          </div>

          {/* Invoice Upload */}
          <div className='flex justify-between'>
            <div>
            <label htmlFor="invoice" className="block text-sm font-medium text-gray-700">
              Upload Invoice (Optional)
            </label>
            <input
              type="file"
              id="invoice"
              name="invoice"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleChange}
              className="mt-1 block text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-500 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-600"
            />
            {formData.invoice && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {formData.invoice.name}
              </p>
            )}
            </div>
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          

          {/* Submit Button */}
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Subscription
            </button>

            
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;