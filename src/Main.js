import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./pages/RootLayout";
import DashBoard from "./pages/DashBoard";

import Association from "./features/cart_analysis/pages/Association";

import InventoriesList from "./features/inventory/pages/InventoriesList";

import AddGoods from "./features/goods/pages/AddGoods";
import GoodsList from "./features/goods/pages/GoodsList";
import GoodsByCategory from "./features/goods/pages/GoodsByCategory";
import GoodsBySubCategory from "./features/goods/pages/GoodsBySubCategory";
import GoodsDetail from "./features/goods/pages/GoodDetail";
import GoodsManagement from "./features/goods/pages/GoodsManagement";

import Login from "./features/member/components/Login";

import Statistics from "./features/statistics/pages/Statistics";
import SalesToday from "./features/statistics/pages/SalesToday";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    id: "root",
    children: [
      {
        // 메인 화면
        path: "/",
        element: <DashBoard />,
      },
      {
        // 매출 조회
        path: "/statistics",
        element: <Statistics />,
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
        path: "/goods/manage",
        element: <GoodsManagement />,
      },
      {
        // 상품등록 페이지 (등록, 수정, 삭제)
        path: "/goods/manage/add",
        element: <AddGoods />,
      },
      {
        path: "app/member/login",
        element: <Login />,
      },
    ],
  },
]);

export default function Main() {
  return <RouterProvider router={router} />;
}
