import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../features/member/UserContext";

export default function PayLayout() {
  const { user } = useUser(); // `user` 상태 가져오기
  const navigate = useNavigate();

  return (
    <main className="overflow-auto">
      <Outlet />
    </main>
  );
}
