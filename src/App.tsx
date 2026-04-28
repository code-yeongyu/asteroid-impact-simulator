import { useRegisterSW } from './registerSW';
import LandingPage from './pages/landing/LandingPage';

export default function App() {
  useRegisterSW();

  return <LandingPage />;
}
