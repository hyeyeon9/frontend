import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Headers from "../components/Headers";
import { UserProvider } from "../features/member/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <div className="flex flex-col h-screen">
        <Headers />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
