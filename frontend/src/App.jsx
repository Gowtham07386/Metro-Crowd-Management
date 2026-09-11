import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppRoutes from '@/routes/AppRoutes';
import SplashScreen from '@/components/common/SplashScreen';

const SPLASH_DURATION_MS = 2400;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="light" />
          </BrowserRouter>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
