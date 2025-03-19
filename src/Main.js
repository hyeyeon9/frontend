import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./pages/RootLayout";
import Association from "./features/cart_analysis/pages/Association";
import GoodsList from "./features/cart_analysis/pages/GoodsList";
import GoodsByCategory from "./features/cart_analysis/pages/GoodsByCategory";
import GoodsBySubCategory from "./features/cart_analysis/pages/GoodsBySubCategory";
import GoodsDetail from "./features/cart_analysis/pages/GoodDetail";

import InventoriesList from "./features/inventory/pages/InventoriesList";
import SalesToday from "./features/statistics/pages/SalesToday";
import DashBoard from "./pages/DashBoard";

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
        path: "/statistics/salesToday",
        element: <SalesToday />,
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
    ],
  },
]);

export default function Main() {
  return <RouterProvider router={router} />;
}
