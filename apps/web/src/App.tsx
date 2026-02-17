import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { userApi } from './lib/api';
import Achievements from './pages/Achievements';
import CommunityFeed from './pages/CommunityFeed';
import Dashboard from './pages/Dashboard';
import DinnerCreate from './pages/DinnerCreate';
import DinnerDetail from './pages/DinnerDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import Rankings from './pages/Rankings';
import Register from './pages/Register';
import RegisterCompany from './pages/RegisterCompany';
import ReviewCreate from './pages/ReviewCreate';
import ReviewEdit from './pages/ReviewEdit';
import RouletteCreate from './pages/RouletteCreate';
import RoulettePlay from './pages/RoulettePlay';
import TeamCreate from './pages/TeamCreate';
import TeamDetail from './pages/TeamDetail';
import TeamJoin from './pages/TeamJoin';
import TeamMap from './pages/TeamMap';
import TeamStats from './pages/TeamStats';
import TicketGiving from './pages/TicketGiving';
import TournamentCreate from './pages/TournamentCreate';
import TournamentPlay from './pages/TournamentPlay';
import { useAuthStore } from './stores/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    userApi
      .getMe()
      .then((me) => {
        updateUser(me);
      })
      .catch(() => {
        logout();
      });
  }, [logout, token, updateUser, user]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/register/company"
        element={
          <ProtectedRoute>
            <RegisterCompany />
          </ProtectedRoute>
        }
      />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/create"
          element={
            <ProtectedRoute>
              <TeamCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/join"
          element={
            <ProtectedRoute>
              <TeamJoin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId"
          element={
            <ProtectedRoute>
              <TeamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/map"
          element={
            <ProtectedRoute>
              <TeamMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/dinners/create"
          element={
            <ProtectedRoute>
              <DinnerCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/dinners/:dinnerId"
          element={
            <ProtectedRoute>
              <DinnerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/dinners/:dinnerId/review"
          element={
            <ProtectedRoute>
              <ReviewCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/reviews/:reviewId/edit"
          element={
            <ProtectedRoute>
              <ReviewEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/tournament"
          element={
            <ProtectedRoute>
              <TournamentCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/tournament/:sessionId/play"
          element={
            <ProtectedRoute>
              <TournamentPlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/roulette"
          element={
            <ProtectedRoute>
              <RouletteCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/roulette/:sessionId/play"
          element={
            <ProtectedRoute>
              <RoulettePlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rankings"
          element={
            <ProtectedRoute>
              <Rankings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/tickets"
          element={
            <ProtectedRoute>
              <TicketGiving />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/stats"
          element={
            <ProtectedRoute>
              <TeamStats />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
