// LoginPage.js
import { useState, useEffect } from "react";
import LoginModal from "../components/LoginModal"; // 로그인 모달 컴포넌트
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(true); // 로그인 모달을 기본적으로 열어놓기
  const { user } = useUser(); // `user` 상태 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // 로그인 상태면 대시보드로 리디렉션
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div>
      {/* 로그인 모달이 열리면 보여줌 */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
