import React, { useState, useEffect } from "react";
import Login from "../components/Login";
import Signup from "../components/Signup";
import UserInfo from "../components/UserInfo";

const AuthPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <div>
      {user ? <UserInfo user={user} /> : <Login setUser={setUser} />}
      <Signup />
    </div>
  );
};

export default AuthPage;
