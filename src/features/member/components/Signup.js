// 회원가입 컴포넌트
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPasswd, setMemberPasswd] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 리로드 방지

    const signupData = {
      memberId: memberId,
      memberPasswd: memberPasswd,
    };

    const response = await fetch("http://localhost:8090/app/member/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    if (response.ok) {
      alert("회원가입 성공!");
      navigate("/app/member/login"); // 회원가입 후 로그인 페이지로 이동
    } else {
      alert("이미 존재하는 아이디입니다.");
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="아이디"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={memberPasswd}
          onChange={(e) => setMemberPasswd(e.target.value)}
          required
        />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Signup;
