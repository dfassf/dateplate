import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes';

function App() {
  useAuth();
  return <AppRoutes />;
}

export default App;
