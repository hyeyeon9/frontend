import React from "react";

const UserInfo = ({ user }) => {
  if (!user) return <p>로그인이 필요합니다.</p>;

  return (
    <div>
      <h2>환영합니다, {user.memberId}!</h2>
      <button onClick={() => window.location.reload()}>새로고침</button>
    </div>
  );
};

export default UserInfo;
