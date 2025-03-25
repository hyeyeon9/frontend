import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";

const Login = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPasswd, setMemberPasswd] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      memberId: memberId,
      memberPasswd: memberPasswd,
    };

    try {
      const response = await fetch("http://localhost:8090/app/member/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.token) {
          localStorage.setItem("token", responseData.token); // ✅ JWT 토큰 저장
          setUser(responseData); // ✅ 사용자 정보 저장
          alert("로그인 성공!");
          navigate("/"); // ✅ 홈으로 이동
        } else {
          alert(responseData.message || "로그인 실패!");
        }
      } else {
        const responseData = await response.json();
        alert(
          `로그인 실패! ${
            responseData.errorMessage || "아이디 또는 비밀번호를 확인하세요."
          }`
        );
      }
    } catch (error) {
      alert("로그인 요청 중 오류가 발생했습니다.");
      console.error("Login error:", error.message || error);
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;
