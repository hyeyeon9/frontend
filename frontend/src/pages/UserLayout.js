import { Outlet } from "react-router-dom";
import UserHeader from "../components/user/UserHeader";
import UserFooter from "../components/user/UserFooter";
import ShopToAdmin from "../components/temp/ShopToAdmin";
import ScrollToTop from "../components/ScrollToTop";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-w-screen bg-white">
      <ScrollToTop />
      <UserHeader />
      <main className="flex justify-center overflow-auto p-6">
        <Outlet />
        <ShopToAdmin />
      </main>
      <UserFooter />
    </div>
  );
}
