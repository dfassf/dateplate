import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import Achievements from '../pages/Achievements';
import CommunityFeed from '../pages/CommunityFeed';
import Dashboard from '../pages/Dashboard';
import DinnerCreate from '../pages/DinnerCreate';
import DinnerDetail from '../pages/DinnerDetail';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Rankings from '../pages/Rankings';
import Register from '../pages/Register';
import RegisterCompany from '../pages/RegisterCompany';
import ReviewCreate from '../pages/ReviewCreate';
import ReviewEdit from '../pages/ReviewEdit';
import RouletteCreate from '../pages/RouletteCreate';
import RoulettePlay from '../pages/RoulettePlay';
import TeamCreate from '../pages/TeamCreate';
import TeamDetail from '../pages/TeamDetail';
import TeamJoin from '../pages/TeamJoin';
import TeamMap from '../pages/TeamMap';
import TeamStats from '../pages/TeamStats';
import TicketGiving from '../pages/TicketGiving';
import TournamentCreate from '../pages/TournamentCreate';
import TournamentPlay from '../pages/TournamentPlay';

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/company" element={<P><RegisterCompany /></P>} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<P><Dashboard /></P>} />
        <Route path="/teams/create" element={<P><TeamCreate /></P>} />
        <Route path="/teams/join" element={<P><TeamJoin /></P>} />
        <Route path="/teams/:teamId" element={<P><TeamDetail /></P>} />
        <Route path="/teams/:teamId/map" element={<P><TeamMap /></P>} />
        <Route path="/teams/:teamId/dinners/create" element={<P><DinnerCreate /></P>} />
        <Route path="/teams/:teamId/dinners/:dinnerId" element={<P><DinnerDetail /></P>} />
        <Route path="/teams/:teamId/dinners/:dinnerId/review" element={<P><ReviewCreate /></P>} />
        <Route path="/teams/:teamId/reviews/:reviewId/edit" element={<P><ReviewEdit /></P>} />
        <Route path="/teams/:teamId/tournament" element={<P><TournamentCreate /></P>} />
        <Route path="/teams/:teamId/tournament/:sessionId/play" element={<P><TournamentPlay /></P>} />
        <Route path="/teams/:teamId/roulette" element={<P><RouletteCreate /></P>} />
        <Route path="/teams/:teamId/roulette/:sessionId/play" element={<P><RoulettePlay /></P>} />
        <Route path="/community" element={<P><CommunityFeed /></P>} />
        <Route path="/rankings" element={<P><Rankings /></P>} />
        <Route path="/achievements" element={<P><Achievements /></P>} />
        <Route path="/teams/:teamId/tickets" element={<P><TicketGiving /></P>} />
        <Route path="/teams/:teamId/stats" element={<P><TeamStats /></P>} />
      </Route>
    </Routes>
  );
}
