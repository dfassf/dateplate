import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeamCreate from './pages/TeamCreate';
import TeamJoin from './pages/TeamJoin';
import TeamDetail from './pages/TeamDetail';
import DinnerCreate from './pages/DinnerCreate';
import DinnerDetail from './pages/DinnerDetail';
import ReviewCreate from './pages/ReviewCreate';
import { useAuthStore } from './stores/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/teams/create" element={<ProtectedRoute><TeamCreate /></ProtectedRoute>} />
        <Route path="/teams/join" element={<ProtectedRoute><TeamJoin /></ProtectedRoute>} />
        <Route path="/teams/:teamId" element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} />
        <Route path="/teams/:teamId/dinners/create" element={<ProtectedRoute><DinnerCreate /></ProtectedRoute>} />
        <Route path="/teams/:teamId/dinners/:dinnerId" element={<ProtectedRoute><DinnerDetail /></ProtectedRoute>} />
        <Route path="/teams/:teamId/dinners/:dinnerId/review" element={<ProtectedRoute><ReviewCreate /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
