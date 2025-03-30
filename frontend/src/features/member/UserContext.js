// member/UserContext.js
import React, { createContext, useContext, useState } from "react";

// user context 생성
const UserContext = createContext();

// UserProvider 컴포넌트 정의
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// useUser 훅 정의
export function useUser() {
  return useContext(UserContext);
}
