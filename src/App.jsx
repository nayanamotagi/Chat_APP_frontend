import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authAPI } from './api/auth';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const { isAuthenticated, setAuth, token } = useAuthStore();

  useEffect(() => {
    if (token && !isAuthenticated) {
      authAPI.getMe()
        .then(res => {
          setAuth(res.data.user, token, useAuthStore.getState().refreshToken);
        })
        .catch(() => {
          useAuthStore.getState().logout();
        });
    }
  }, [token, isAuthenticated, setAuth]);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;

