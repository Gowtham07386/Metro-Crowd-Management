import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/hooks/useApp';
import { ROUTES, ROLES } from '@/constants';
import Spinner from '@/components/common/Spinner';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gradient">
      <Spinner size={28} />
    </div>
  );
}

/** Requires a signed-in user; otherwise redirects to /login. */
export function RequireAuth({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  return children;
}

/** Keeps signed-in users out of /login. */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  return children;
}

/** Requires a role to already be chosen; otherwise sends back to role select. */
export function RequireRole({ children }) {
  const { role } = useApp();
  if (!role) return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  return children;
}

/**
 * Requires a role AND a specific matching role, plus a selected city.
 * expectedRole: 'passenger' | 'administrator'
 */
export function RequireRoleAndCity({ expectedRole, children }) {
  const { role, cityId } = useApp();
  if (!role) return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  if (role !== expectedRole) return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  if (!cityId) {
    // Administrators verify their city assignment via OTP as part of the
    // Continue As flow — they should never land on the plain passenger
    // city picker, which has no verification step.
    return <Navigate to={expectedRole === ROLES.ADMIN ? ROUTES.SELECT_ROLE : ROUTES.SELECT_CITY} replace />;
  }
  return children;
}
