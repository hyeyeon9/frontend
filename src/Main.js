import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import Statistics from "./features/statistics/pages/Statistics";
import Login from './features/member/components/Login';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      id: "root",
      children: [
        {
          index: true, // '/' 경로를 의미
          element: <Home />,
        },
        {
          path: "statistics", // 상대 경로로 설정
          element: <Statistics />,
        },
        {
          path: "app/member/login", // 상대 경로로 변경
          element: <Login />, // 로그인 페이지 컴포넌트를 추가
        },
      {
        // 메인 화면
        path: "/",
        element: <Home />,
      },
      {
        // 매출 조회
        path: "/statistics",
        element: <Statistics />,
      },
    ],
  },
]);

export default function Main() {
  return <RouterProvider router={router} />;
