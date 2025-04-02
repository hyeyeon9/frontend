import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./pages/RootLayout";
import UserLayout from "./pages/UserLayout";

import Association from "./features/cart_analysis/pages/Association";

import InventoriesList from "./features/inventory/pages/InventoriesList";

import AddGoods from "./features/goods/pages/AddGoods";
import GoodsDetail from "./features/goods/pages/GoodDetail";
import GoodsByCategory from "./features/goods/pages/GoodsByCategory";
import GoodsBySubCategory from "./features/goods/pages/GoodsBySubCategory";
import GoodsList from "./features/goods/pages/GoodsList";

import DashBoard from "./features/dashboard/pages/DashBoard";
import ExpiringItemsPage from "./features/dashboard/pages/ExpiringItemsPage";
import DisposalAnalyze from "./features/disposal/pages/DisposalAnalyze";
import DispoalList from "./features/disposal/pages/DisposalPage";
import OrderingPage from "./features/ordering/pages/OrderingPage";
import SalesReport from "./features/sales_analysis/pages/SalesReport";

import SalesComparison from "./features/statistics/pages/SalesComparison";
import Statistics from "./features/statistics/pages/Statistics";
import LoginPage from "./features/member/pages/LoginPage";
import SignUpPage from "./features/member/pages/SignupPage";

import GoodsEdit from "./features/goods/pages/GoodsEdit";
import SmartChatBot from "./components/SmartChatBot";

import ShopHome from "./features/shop/pages/ShopHome";

const router = createBrowserRouter([
  {
    // 관리자 페이지(기본)
    path: "/",
    element: <RootLayout />,
    children: [
      {
        // 메인 화면
        index: true,
        path: "/",
        element: <DashBoard />,
      },
      {
        // 로그인
        path: "/login", // 상대 경로로 변경
        element: <LoginPage />, // 로그인 페이지 컴포넌트를 추가
      },
      {
        // 회원가입
        path: "/signup",
        element: <SignUpPage />,
      },
      {
        // 매출 조회
        path: "/statistics",
        element: <Statistics />,
      },
      {
        // 매출 비교
        path: "/salesDiff",
        element: <SalesComparison />,
      },
      {
        // 매출 분석
        path: "/salesReport",
        element: <SalesReport />,
      },
      {
        // 상품찾기
        path: "/categories/findAll",
        element: <GoodsList />,
      },
      {
        // 카테고리별
        path: "/categories/:firstname",
        element: <GoodsByCategory />,
      },
      {
        // 카테고리별 ( 소분류 )
        path: "/categories/:firstname/:secondname",
        element: <GoodsBySubCategory />,
      },
      {
        // 상품상세보기
        path: "/goods/findById/:id",
        element: <GoodsDetail />,
      },
      {
        // 장바구니분석
        path: "/association",
        element: <Association />,
      },
      {
        // 재고관리 (전체재고조회)
        path: "/inventory/findAll",
        element: <InventoriesList />,
      },
      {
        // 상품관리 페이지 (수정, 삭제)
        path: "/goods/edit/:id",
        element: <GoodsEdit />,
      },
      {
        // 상품등록 페이지 (등록, 수정, 삭제)
        path: "/goods/manage/add",
        element: <AddGoods />,
      },
      {
        // 폐기 관리 페이지
        path: "/disposal",
        element: <DispoalList />,
      },
      {
        // 폐기 관리 페이지
        path: "/disposal/analyze",
        element: <DisposalAnalyze />,
      },
      {
        // 유통기한 임박 상품 페이지
        path: "/expiring-items",
        element: <ExpiringItemsPage />,
      },
      {
        // 발주 관리 페이지
        path: "/orders",
        element: <OrderingPage />,
      },

      {
        // 챗봇 페이지
        path: "/chatBot",
        element: <SmartChatBot />,
      },
    ],
  },
  {
    // 사용자 페이지
    path: "/shop",
    element: <UserLayout />,
    children: [
      {
        // 메인 페이지
        index: true,
        path: "home",
        element: <ShopHome />,
      },
    ],
  },
]);

export default function Main() {
  return <RouterProvider router={router} />;
}
