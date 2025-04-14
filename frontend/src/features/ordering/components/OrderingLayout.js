import { Outlet, Link, useLocation } from "react-router-dom";
import { ShoppingCart, Package } from "lucide-react";

export default function OrderingLayout() {
  const location = useLocation();
  const isListPage = location.pathname.includes("/orders/list");

  return (
    <div className="bg-gray-50 min-h-screen p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* 네비게이션 탭 */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link
            to="/orders"
            className={`flex items-center px-4 py-3 ${
              !isListPage
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            발주 관리
          </Link>
          <Link
            to="/orders/list"
            className={`flex items-center px-4 py-3 ${
              isListPage
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            <Package className="h-5 w-5 mr-2" />
            발주 리스트
          </Link>
        </div>

        {/* 아래 Outlet이 페이지 내용을 대체 */}
        <Outlet />
      </div>
    </div>
  );
}
