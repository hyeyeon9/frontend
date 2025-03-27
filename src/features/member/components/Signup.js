// 회원가입 컴포넌트
import { Button, TextInput } from "flowbite-react";
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
      navigate("/login"); // 회원가입 후 로그인 페이지로 이동
    } else {
      alert("이미 존재하는 아이디입니다.");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSignup}
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
          회원가입
        </Button>
      </form>
    </div>
  );
};

export default Signup;
