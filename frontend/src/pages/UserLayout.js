import { Outlet } from "react-router-dom";
import UserHeader from "../components/user/UserHeader";
import UserFooter from "../components/user/UserFooter";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
}
