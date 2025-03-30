import { useNavigate } from "react-router-dom";

const Logout = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 로컬 스토리지에서 토큰 삭제
    setUser(null); // 로그인 상태 초기화
    alert("로그아웃 되었습니다.");
    navigate("/"); // 홈으로 이동
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default Logout;
