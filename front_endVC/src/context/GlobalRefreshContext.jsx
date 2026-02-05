import { createContext, useContext, useEffect, useState } from "react";

const GlobalRefreshContext = createContext(0);

export function GlobalRefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 5000); // cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <GlobalRefreshContext.Provider value={refreshKey}>
      {children}
    </GlobalRefreshContext.Provider>
  );
}

export const useGlobalRefresh = () => useContext(GlobalRefreshContext);
