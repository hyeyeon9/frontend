// 회원가입 컴포넌트
import { useState } from "react";

const Signup = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPasswd, setMemberPasswd] = useState("");

  const handleSignup = async () => {
    const response = await fetch("http://localhost:8090/app/member/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId, memberPasswd }),
    });

    if (response.ok) {
      alert("회원가입 성공!");
    } else {
      alert("회원가입 실패! 다시 시도해 주세요.");
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <input
        type="text"
        placeholder="아이디"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={memberPasswd}
        onChange={(e) => setMemberPasswd(e.target.value)}
      />
      <button onClick={handleSignup}>가입하기</button>
    </div>
  );
};

export default Signup;
