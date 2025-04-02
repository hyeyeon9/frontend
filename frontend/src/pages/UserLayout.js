import { Outlet } from "react-router-dom";
import UserHeader from "../components/user/UserHeader";
import UserFooter from "../components/user/UserFooter";
import ShopToAdmin from "../components/temp/ShopToAdmin";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-w-screen">
      <UserHeader />
      <main className="flex-1 p-4">
        <Outlet />
        <ShopToAdmin />
      </main>
      <UserFooter />
    </div>
  );
}
