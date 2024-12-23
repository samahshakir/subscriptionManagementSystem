import { createContext, useContext, useState } from 'react';

// Create a Context
const UserContext = createContext();

// Custom hook to use the user context
export const useUserContext = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  const saveUser = (userData) => {
    setUserId(userData._id);
    localStorage.setItem('authToken', userData.token);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('authToken');
  };

  return (
    <UserContext.Provider value={{ userId, saveUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};