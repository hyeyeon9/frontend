import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Headers from "../components/Headers";
import Sidebar from "../components/Sidebar";
import { useUser } from "../features/member/UserContext";

export default function RootLayout() {
  const { user } = useUser(); // `user` 상태 가져오기
  const navigate = useNavigate();

  // useEffect(() => {
  //   // 로그인하지 않은 경우 로그인 페이지로 리다이렉션
  //   if (
  //     !user &&
  //     window.location.pathname !== "/login" &&
  //     window.location.pathname !== "/signup"
  //   ) {
  //     navigate("/login"); // 로그인하지 않으면 로그인 페이지로 리디렉션
  //   }
  // }, [user, navigate]);

  return (
    <div className="flex flex-col h-screen">
      <Headers />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
