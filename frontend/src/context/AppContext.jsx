import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  ROLE_STORAGE_KEY,
  CITY_STORAGE_KEY,
  STATION_STORAGE_KEY,
  EMPLOYEE_ID_STORAGE_KEY,
  EMPLOYEE_ROLE_STORAGE_KEY,
} from "@/constants";

import { getCityById } from "@/data/cities";


// ============================================================
// APP CONTEXT
// ============================================================

export const AppContext = createContext(null);


// ============================================================
// READ STORED STATION
// ============================================================

function readStoredStation() {
  try {
    const raw = localStorage.getItem(STATION_STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


// ============================================================
// APP PROVIDER
// ============================================================

export function AppProvider({ children }) {

  // ----------------------------------------------------------
  // ROLE
  // ----------------------------------------------------------

  const [role, setRoleState] = useState(
    () =>
      localStorage.getItem(ROLE_STORAGE_KEY) ||
      null
  );


  // ----------------------------------------------------------
  // CITY
  // ----------------------------------------------------------

  const [cityId, setCityIdState] = useState(
    () =>
      localStorage.getItem(CITY_STORAGE_KEY) ||
      null
  );


  // ----------------------------------------------------------
  // STATION
  // ----------------------------------------------------------

  const [station, setStationState] = useState(
    readStoredStation
  );


  // ----------------------------------------------------------
  // EMPLOYEE ID
  // ----------------------------------------------------------

  const [employeeId, setEmployeeIdState] = useState(
    () =>
      localStorage.getItem(
        EMPLOYEE_ID_STORAGE_KEY
      ) || null
  );


  // ----------------------------------------------------------
  // EMPLOYEE ROLE
  // ----------------------------------------------------------

  const [employeeRole, setEmployeeRoleState] =
    useState(
      () =>
        localStorage.getItem(
          EMPLOYEE_ROLE_STORAGE_KEY
        ) || null
    );


  // ==========================================================
  // SET ROLE
  // ==========================================================

  const setRole = useCallback(
    (nextRole) => {

      setRoleState(nextRole);

      if (nextRole) {
        localStorage.setItem(
          ROLE_STORAGE_KEY,
          nextRole
        );
      } else {
        localStorage.removeItem(
          ROLE_STORAGE_KEY
        );
      }
    },
    []
  );


  // ==========================================================
  // SET CITY
  // ==========================================================

  const setCityId = useCallback(
    (nextCityId) => {

      setCityIdState(nextCityId);

      if (nextCityId) {
        localStorage.setItem(
          CITY_STORAGE_KEY,
          nextCityId
        );
      } else {
        localStorage.removeItem(
          CITY_STORAGE_KEY
        );
      }
    },
    []
  );


  // ==========================================================
  // SET STATION
  // ==========================================================

  const setStation = useCallback(
    (nextStation) => {

      setStationState(nextStation);

      if (nextStation) {

        localStorage.setItem(
          STATION_STORAGE_KEY,
          JSON.stringify(nextStation)
        );

      } else {

        localStorage.removeItem(
          STATION_STORAGE_KEY
        );
      }
    },
    []
  );


  // ==========================================================
  // SET EMPLOYEE ID
  // ==========================================================

  const setEmployeeId = useCallback(
    (nextEmployeeId) => {

      setEmployeeIdState(nextEmployeeId);

      if (nextEmployeeId) {

        localStorage.setItem(
          EMPLOYEE_ID_STORAGE_KEY,
          nextEmployeeId
        );

      } else {

        localStorage.removeItem(
          EMPLOYEE_ID_STORAGE_KEY
        );
      }
    },
    []
  );


  // ==========================================================
  // SET EMPLOYEE ROLE
  // ==========================================================

  const setEmployeeRole = useCallback(
    (nextEmployeeRole) => {

      setEmployeeRoleState(nextEmployeeRole);

      if (nextEmployeeRole) {

        localStorage.setItem(
          EMPLOYEE_ROLE_STORAGE_KEY,
          nextEmployeeRole
        );

      } else {

        localStorage.removeItem(
          EMPLOYEE_ROLE_STORAGE_KEY
        );
      }
    },
    []
  );


  // ==========================================================
  // RESET EVERYTHING
  // ==========================================================

  const resetSelection = useCallback(() => {

    setRoleState(null);
    setCityIdState(null);
    setStationState(null);
    setEmployeeIdState(null);
    setEmployeeRoleState(null);

    localStorage.removeItem(
      ROLE_STORAGE_KEY
    );

    localStorage.removeItem(
      CITY_STORAGE_KEY
    );

    localStorage.removeItem(
      STATION_STORAGE_KEY
    );

    localStorage.removeItem(
      EMPLOYEE_ID_STORAGE_KEY
    );

    localStorage.removeItem(
      EMPLOYEE_ROLE_STORAGE_KEY
    );

  }, []);


  // ==========================================================
  // CLEAR CITY
  // ==========================================================

  const clearCity = useCallback(() => {

    setCityIdState(null);

    localStorage.removeItem(
      CITY_STORAGE_KEY
    );

  }, []);


  // ==========================================================
  // CURRENT CITY OBJECT
  // ==========================================================

  const city = cityId
    ? getCityById(cityId)
    : null;


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AppContext.Provider
      value={{

        role,
        setRole,

        cityId,
        city,
        setCityId,

        station,
        setStation,

        employeeId,
        setEmployeeId,

        employeeRole,
        setEmployeeRole,

        resetSelection,
        clearCity,

      }}
    >

      {children}

    </AppContext.Provider>
  );
}


// ============================================================
// useApp HOOK
// ============================================================
//
// This was missing from your previous file.
// LiveCrowd.jsx and other pages import:
// import { useApp } from "@/context/AppContext";
// ============================================================

export function useApp() {

  const context = useContext(AppContext);

  if (!context) {

    throw new Error(
      "useApp must be used inside AppProvider"
    );

  }

  return context;
}