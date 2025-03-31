import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { Button, TextInput } from "flowbite-react";

export default function Login({ onLoginSuccess }) {
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
          localStorage.setItem("token", responseData.token); // JWT 토큰 저장
          setUser(responseData); // 사용자 정보 저장
          alert("로그인 성공!");
          if (onLoginSuccess) onLoginSuccess(); // 로그인 성공 후 모달 닫기
          navigate("/"); // 대시보드로 이동
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
      <form
        onSubmit={handleLogin}
        className="flex flex-col justify-center items-center h-full space-y-4"
      >
        <div className="flex items-center space-x-4">
          <label
            htmlFor="memberId"
            className="text-lg text-gray-700 dark:text-gray-300 w-24"
          >
            아이디
          </label>
          <TextInput
            id="memberId"
            type="text"
            placeholder="아이디"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            className="p-2 border rounded-md"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label
            htmlFor="memberPasswd"
            className="text-lg text-gray-700 dark:text-gray-300 w-24"
          >
            비밀번호
          </label>
          <TextInput
            id="memberPasswd"
            type="password"
            placeholder="비밀번호"
            value={memberPasswd}
            onChange={(e) => setMemberPasswd(e.target.value)}
            required
            className="p-2 border rounded-md"
          />
        </div>
        <Button
          type="submit"
          className="w-full py-2 mt-4 text-2xl bg-blue-400 text-white rounded-md hover:bg-blue-500"
        >
          로그인
        </Button>
      </form>
    </div>
  );
}
