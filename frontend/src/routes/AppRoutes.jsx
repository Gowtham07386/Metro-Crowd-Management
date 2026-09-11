import { Route, Routes } from 'react-router-dom';
import { ROUTES, ROLES } from '@/constants';

import { RequireAuth, PublicOnlyRoute, RequireRoleAndCity } from '@/components/auth/Guards';
import PassengerLayout from '@/layouts/PassengerLayout';
import AdminLayout from '@/layouts/AdminLayout';

import Login from '@/pages/auth/Login';
import Landing from '@/pages/Landing';
import RoleSelect from '@/pages/auth/RoleSelect';
import CitySelect from '@/pages/auth/CitySelect';
import AdminSelectCity from '@/pages/auth/AdminSelectCity';
import AdminSelectStation from '@/pages/auth/AdminSelectStation';

import PassengerDashboard from '@/pages/passenger/Dashboard';
import JourneyPlanner from '@/pages/passenger/JourneyPlanner';
import LiveCrowd from '@/pages/passenger/LiveCrowd';
import MetroMap from '@/pages/passenger/MetroMap';
import AISuggestions from '@/pages/passenger/AISuggestions';
import EmergencyHelp from '@/pages/passenger/EmergencyHelp';
import About from '@/pages/passenger/About';

import AdminDashboard from '@/pages/admin/Dashboard';
import Analytics from '@/pages/admin/Analytics';
import LiveMonitoring from '@/pages/admin/LiveMonitoring';
import StationManagement from '@/pages/admin/StationManagement';
import TrainScheduling from '@/pages/admin/TrainScheduling';
import AIPrediction from '@/pages/admin/AIPrediction';
import Reports from '@/pages/admin/Reports';
import UserManagement from '@/pages/admin/UserManagement';

import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Landing />} />

      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path={ROUTES.SELECT_ROLE}
        element={
          <RequireAuth>
            <RoleSelect />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.SELECT_CITY}
        element={
          <RequireAuth>
            <CitySelect />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_SELECT_CITY}
        element={
          <RequireAuth>
            <AdminSelectCity />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_SELECT_STATION}
        element={
          <RequireAuth>
            <AdminSelectStation />
          </RequireAuth>
        }
      />

      {/* Passenger flow */}
      <Route
        element={
          <RequireAuth>
            <RequireRoleAndCity expectedRole={ROLES.PASSENGER}>
              <PassengerLayout />
            </RequireRoleAndCity>
          </RequireAuth>
        }
      >
        <Route path={ROUTES.PASSENGER.DASHBOARD} element={<PassengerDashboard />} />
        <Route path={ROUTES.PASSENGER.JOURNEY_PLANNER} element={<JourneyPlanner />} />
        <Route path={ROUTES.PASSENGER.LIVE_CROWD} element={<LiveCrowd />} />
        <Route path={ROUTES.PASSENGER.METRO_MAP} element={<MetroMap />} />
        <Route path={ROUTES.PASSENGER.AI_SUGGESTIONS} element={<AISuggestions />} />
        <Route path={ROUTES.PASSENGER.EMERGENCY_HELP} element={<EmergencyHelp />} />
        <Route path={ROUTES.PASSENGER.ABOUT} element={<About />} />
        <Route path={ROUTES.PASSENGER.PROFILE} element={<Profile />} />
        <Route path={ROUTES.PASSENGER.SETTINGS} element={<Settings />} />
      </Route>

      {/* Administrator flow */}
      <Route
        element={
          <RequireAuth>
            <RequireRoleAndCity expectedRole={ROLES.ADMIN}>
              <AdminLayout />
            </RequireRoleAndCity>
          </RequireAuth>
        }
      >
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN.ANALYTICS} element={<Analytics />} />
        <Route path={ROUTES.ADMIN.LIVE_MONITORING} element={<LiveMonitoring />} />
        <Route path={ROUTES.ADMIN.STATIONS} element={<StationManagement />} />
        <Route path={ROUTES.ADMIN.SCHEDULING} element={<TrainScheduling />} />
        <Route path={ROUTES.ADMIN.AI_PREDICTION} element={<AIPrediction />} />
        <Route path={ROUTES.ADMIN.REPORTS} element={<Reports />} />
        <Route path={ROUTES.ADMIN.USERS} element={<UserManagement />} />
        <Route path={ROUTES.ADMIN.PROFILE} element={<Profile />} />
        <Route path={ROUTES.ADMIN.SETTINGS} element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
