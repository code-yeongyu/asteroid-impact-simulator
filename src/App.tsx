import { useRegisterSW } from './registerSW';
import { BrowserRouter, Routes, Route } from 'react-router';
import LandingPage from './pages/landing/LandingPage';
import SimulatorPage from './pages/simulator/SimulatorPage';

export default function App() {
  useRegisterSW();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
