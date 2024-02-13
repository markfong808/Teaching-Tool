import React, { createContext, useState } from 'react';

export const TimesContext = createContext(null);

export const TimesProvider = ({ children }) => {
  const [timesInstance, setTimesInstance] = useState(null);

  return (
    <TimesContext.Provider value={{ timesInstance, setTimesInstance }}>
      {children}
    </TimesContext.Provider>
  );
};
