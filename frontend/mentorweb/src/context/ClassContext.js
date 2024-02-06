import React, { createContext, useState } from 'react';

export const ClassContext = createContext(null);

export const ClassProvider = ({ children }) => {
  const [classInstance, setClassInstance] = useState(null);

  return (
    <ClassContext.Provider value={{ classInstance, setClassInstance }}>
      {children}
    </ClassContext.Provider>
  );
};
