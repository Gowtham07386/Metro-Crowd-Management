export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SELECT_ROLE: '/select-role',
  SELECT_CITY: '/select-city',
  ADMIN_SELECT_CITY: '/admin/select-city',
  ADMIN_SELECT_STATION: '/admin/select-station',

  PASSENGER: {
    ROOT: '/passenger',
    DASHBOARD: '/passenger/dashboard',
    JOURNEY_PLANNER: '/passenger/journey-planner',
    LIVE_CROWD: '/passenger/live-crowd',
    METRO_MAP: '/passenger/metro-map',
    AI_SUGGESTIONS: '/passenger/ai-suggestions',
    EMERGENCY_HELP: '/passenger/emergency-help',
    ABOUT: '/passenger/about',
    PROFILE: '/passenger/profile',
    SETTINGS: '/passenger/settings',
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    LIVE_MONITORING: '/admin/live-monitoring',
    STATIONS: '/admin/stations',
    SCHEDULING: '/admin/scheduling',
    AI_PREDICTION: '/admin/ai-prediction',
    REPORTS: '/admin/reports',
    USERS: '/admin/users',
    PROFILE: '/admin/profile',
    SETTINGS: '/admin/settings',
  },
};

export const ROLES = {
  PASSENGER: 'passenger',
  ADMIN: 'administrator',
};

export const AUTH_STORAGE_KEY = 'metroflow_auth';
export const ROLE_STORAGE_KEY = 'metroflow_role';
export const CITY_STORAGE_KEY = 'metroflow_city';
export const STATION_STORAGE_KEY = 'metroflow_station';
export const EMPLOYEE_ID_STORAGE_KEY = 'metroflow_employee_id';
export const EMPLOYEE_ROLE_STORAGE_KEY = 'metroflow_employee_role';
export const THEME_STORAGE_KEY = 'metroflow_theme';

export const ACCOUNT_TYPE_LABELS = {
  [ROLES.PASSENGER]: 'User',
  [ROLES.ADMIN]: 'Administrator',
};

// Dummy OTP for the admin verification flow — replace with a real backend call later.
export const DEMO_OTP_CODE = '123456';

export const APP_NAME = 'MetroFlow';
export const APP_TAGLINE = 'Smart Metro Management System';

export const CROWD_STATUS = {
  GREEN: { key: 'GREEN', label: 'Smooth', color: '#17b26a' },
  YELLOW: { key: 'YELLOW', label: 'Moderate', color: '#f7c948' },
  ORANGE: { key: 'ORANGE', label: 'Busy', color: '#f79009' },
  RED: { key: 'RED', label: 'Overcrowded', color: '#f04438' },
};

export function occupancyToStatus(occupancy) {
  if (occupancy >= 85) return CROWD_STATUS.RED;
  if (occupancy >= 65) return CROWD_STATUS.ORANGE;
  if (occupancy >= 40) return CROWD_STATUS.YELLOW;
  return CROWD_STATUS.GREEN;
}

