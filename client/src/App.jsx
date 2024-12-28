import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
// import SubscriptionForm from './components/SubscriptionForm';
import SubscriptionList from './components/SubscriptionList';
import Register from './pages/Register';
import Login from './pages/Login';
import SubForm from './components/SubForm';
// import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken'); // Retrieve the token
  const isAuthenticated = !!token; // Check if token exists
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
          <Route 
            path="/register" 
            element={
                <Register />
            } 
          />
          <Route 
            path="/login" 
            element={
                <Login />
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-subscription" 
            element={
              <ProtectedRoute>
                <SubForm mode='add'/>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/subscriptions" 
            element={
              <ProtectedRoute>
                <SubscriptionList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/update-subscriptions/:id" 
            element={
              <ProtectedRoute>
                <SubForm mode='update'/>
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          /> */}
        {/* </Route> */}

        {/* 404 Not Found Route */}
        <Route 
          path="*" 
          element={<div>Page Not Found</div>} 
        />
      </Routes>
    </Router>
  );
}

export default App;