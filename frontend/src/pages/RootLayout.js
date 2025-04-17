import { Outlet } from "react-router-dom";
import Headers from "../components/Headers";
import Sidebar from "../components/Sidebar";
import ScrollToTop from "../components/ScrollToTop";
import ChatWidget from "../components/ChatWidget";

export default function RootLayout() {
  return (
    <div className="flex flex-col bg-[#f5f6f7]">
      <ScrollToTop />
      <Headers />
      <div className="flex flex-1 pt-14">
        <Sidebar />
        <main
          className="flex-1 
                ml-0 
                lg:ml-[12rem] 
                max-w-full 
                lg:p-4 
                overflow-auto"
        >
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
