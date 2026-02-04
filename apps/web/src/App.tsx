import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Couple from './pages/Couple';
import Restaurants from './pages/Restaurants';
import DateRecords from './pages/DateRecords';

const queryClient = new QueryClient();

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="couple"
              element={
                <ProtectedRoute>
                  <Couple />
                </ProtectedRoute>
              }
            />
            <Route
              path="restaurants"
              element={
                <ProtectedRoute>
                  <Restaurants />
                </ProtectedRoute>
              }
            />
            <Route
              path="dates"
              element={
                <ProtectedRoute>
                  <DateRecords />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App
