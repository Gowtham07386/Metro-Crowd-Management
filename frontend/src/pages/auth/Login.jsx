import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginBackground from '@/components/auth/LoginBackground';
import AuthShell from '@/components/auth/AuthShell';
import { ROUTES } from '@/constants';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('login'); // 'login' | 'register'

  const handleSignedIn = () => {
    const redirectTo = location.state?.from?.pathname || ROUTES.SELECT_ROLE;
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <LoginBackground />

      <div className="relative z-10 flex w-full justify-center">
        <AuthShell view={view} onViewChange={setView} onSignedIn={handleSignedIn} />
      </div>
    </div>
  );
}
