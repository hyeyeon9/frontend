import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import SignupModal from "../components/SignupModal";

export default function SignUpPage() {
  const [isModalOpen, setIsModalOpen] = useState(true); // 모달을 기본적으로 열어놓기
  const { user } = useUser(); // `user` 상태 가져오기
  const navigate = useNavigate();

  // 모달을 열기 위한 함수
  const openSignupModal = () => {
    setIsModalOpen(true);
  };

  // 모달을 닫기 위한 함수
  const closeSignupModal = () => {
    setIsModalOpen(false);
  };

  // 만약 사용자가 이미 로그인되어 있다면, 메인 페이지로 리디렉션
  useEffect(() => {
    if (user) {
      navigate("/"); // 로그인한 사용자가 있다면 메인 페이지로 이동
    }
  }, [user, navigate]);

  return (
    <div>
      {/* 이 부분에서 모달 열리는 상태를 제대로 전달하도록 수정 */}
      <SignupModal isOpen={isModalOpen} onClose={closeSignupModal} />
    </div>
  );
}
