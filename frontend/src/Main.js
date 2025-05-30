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

import Statistics from "./features/statistics/pages/Statistics";
import SalesHistory from "./features/statistics/pages/SalesHistory";
import SalesHistoryDetail from "./features/statistics/pages/SalesHistoryDetail";

import LoginPage from "./features/member/pages/LoginPage";
import SignUpPage from "./features/member/pages/SignupPage";

import GoodsEdit from "./features/goods/pages/GoodsEdit";

import ShopHome from "./features/shop/pages/ShopHome";
import CartPage from "./features/shop/pages/CartPage";
import ProductsPage from "./features/shop/pages/ProductsPage";
import ProductDetailPage from "./features/shop/pages/ProductDetailPage";
import { CheckoutPage } from "./features/shop/feature/payments/Checkout";
import { SuccessPage } from "./features/shop/feature/payments/Success";
import { FailPage } from "./features/shop/feature/payments/Fail";
import PayLayout from "./pages/PayLayout";

import OrderCompletePage from "./features/shop/pages/OrderCompletePage";
import DiscountingPage from "./features/shop/pages/DiscountingPage";
import OrderingList from "./features/ordering/pages/OrderingList";
import OrderingLayout from "./features/ordering/components/OrderingLayout";

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
        // 판매내역
        path: "/salesHistory",
        element: <SalesHistory />,
      },
      {
        // 상세 판매내역
        path: "/salesHistory/:orderId",
        element: <SalesHistoryDetail />,
      },
      {
        // 매출 통계
        path: "/statistics",
        element: <Statistics />,
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
        path: "/orders",
        element: <OrderingLayout />,
        children: [
          { path: "", element: <OrderingPage /> },
          { path: "list", element: <OrderingList /> },
        ],
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
        path: "",
        element: <ShopHome />,
      },
      {
        // 상품 페이지
        path: "products",
        element: <ProductsPage />,
      },
      {
        // 상품 상세보기 페이지
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        // 장바구니 페이지
        path: "cart",
        element: <CartPage />,
      },
      {
        // 결제 완료 페이지
        path: "complete",
        element: <OrderCompletePage />,
      },
      {
        // 할인 상품 페이지
        path: "discounting",
        element: <DiscountingPage />,
      },
    ],
  },
  {
    // 결제 페이지(토스페이)
    path: "/payment",
    element: <PayLayout />,
    children: [
      {
        // 결제 메인
        path: "",
        element: <CheckoutPage />,
      },
      {
        // 결제 성공
        path: "success",
        element: <SuccessPage />,
      },
      {
        // 결제 실패
        path: "fail",
        element: <FailPage />,
      },
    ],
  },
]);

export default function Main() {
  return <RouterProvider router={router} />;
}
