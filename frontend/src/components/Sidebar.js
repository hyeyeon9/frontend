import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Using Lucide icons for the mobile toggle

export default function Sidebar() {
  // 현재 링크
  const location = useLocation();

  // Add this function inside the Sidebar component
  const isLinkActive = (path) => location.pathname === path;

  // 메뉴의 열고 닫는 상태를 관리
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isStocksOpen, setIsStocksOpen] = useState(false);
  const [isGoodsOpen, setIsGoodsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 일정 크기 미만에서 모바일용 화면으로 전환
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button - Fixed at the top left corner */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-3 left-4 z-[1000] lg:hidden bg-white p-2 rounded-lg shadow-md"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile - only visible when sidebar is open on mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-14 left-0 z-[1000] h-screen transition-all duration-300 ease-in-out
           ${
             isMobileOpen
               ? "translate-x-0"
               : "-translate-x-full lg:translate-x-0"
           } 
           lg:w-[12rem] sm:w-[12rem] w-[40vw] flex-shrink-0 overflow-y-auto
           bg-white shadow-xl rounded-r-xl lg:rounded-xl dark:bg-gray-800 dark:text-white`}
      >
        <div className="p-3 mb-2 flex justify-between items-center">
          {/* Close button for mobile - only visible on mobile */}
          {/* <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        <nav className="flex min-w-0 flex-col gap-1 p-2 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-200">
          {/* 사이드메뉴1 */}
          <Link
            to="/"
            className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start
    ${
      location.pathname === "/"
        ? "bg-blue-700 text-white"
        : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
    }`}
          >
            <div className="grid mr-2 place-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            대시보드
          </Link>
          {/* 사이드메뉴2 */}
          <div className="relative block w-full">
            <div
              role="button"
              className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <button
                type="button"
                className="flex items-center justify-between w-full p-2 font-sans text-sm antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900 dark:text-gray-200 dark:hover:text-white"
                onClick={() => setIsSalesOpen((prev) => !prev)}
              >
                <div className="grid mr-2 place-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5ZM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5ZM3.375 15h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h7.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 10.875 9h-7.5A.375.375 0 0 0 3 9.375v1.5c0 .207.168.375.375.375Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="block mr-auto font-sans text-sm antialiased font-normal leading-relaxed text-blue-gray-900 dark:text-gray-200">
                  매출조회
                </p>
                <span
                  className={`ml-2 transition-transform ${
                    isSalesOpen ? "" : "rotate-180"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-3 h-3 mx-auto transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
            <div className="overflow-hidden">
              {/* 서브 메뉴: isDashBoardOpen이 true일 때만 표시 */}
              {isSalesOpen && (
                <div className="block w-full py-1 font-sans text-xs antialiased font-light leading-normal text-gray-700 dark:text-gray-300">
                  <nav className="flex min-w-0 flex-col gap-1 p-0 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-300">
                    <Link
                      to="/salesHistory"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/salesHistory")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      판매기록 조회
                    </Link>
                    <Link
                      to="/statistics"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/statistics")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      기간별 매출 조회
                    </Link>
                    <Link
                      to="/salesReport"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/salesReport")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      매출 레포트
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </div>
          {/* 사이드메뉴 3 */}
          <Link
            to="/association"
            className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
              isLinkActive("/association")
                ? "bg-blue-700 text-white"
                : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
            }`}
          >
            <div className="grid mr-2 place-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5c-1.921 0-3.816.111-5.68.327-1.497.174-2.57 1.46-2.57 2.93V21.75a.75.75 0 0 0 1.029.696l3.471-1.388 3.472 1.388a.75.75 0 0 0 .556 0l3.472-1.388 3.471 1.388a.75.75 0 0 0 1.029-.696V4.757c0-1.47-1.073-2.756-2.57-2.93A49.255 49.255 0 0 0 12 1.5Zm3.53 7.28a.75.75 0 0 0-1.06-1.06l-6 6a.75.75 0 1 0 1.06 1.06l6-6ZM8.625 9a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm5.625 3.375a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            장바구니 분석
          </Link>
          {/* 사이드메뉴4 */}
          <div className="relative block w-full">
            <div
              role="button"
              className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <button
                type="button"
                className="flex items-center justify-between w-full p-2 font-sans text-sm antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900 dark:text-gray-200 dark:hover:text-white"
                onClick={() => setIsStocksOpen((prev) => !prev)}
              >
                <div className="grid mr-2 place-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-4 h-4"
                  >
                    <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
                  </svg>
                </div>
                <p className="block mr-auto font-sans text-sm antialiased font-normal leading-relaxed text-blue-gray-900 dark:text-gray-200">
                  재고관리
                </p>
                <span
                  className={`ml-2 transition-transform ${
                    isStocksOpen ? "" : "rotate-180"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-3 h-3 mx-auto transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
            <div className="overflow-hidden">
              {/* 서브 메뉴: isStocksOpen이 true일 때만 표시 */}
              {isStocksOpen && (
                <div className="block w-full py-1 font-sans text-xs antialiased font-light leading-normal text-gray-700 dark:text-gray-300">
                  <nav className="flex min-w-0 flex-col gap-1 p-0 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-300">
                    <Link
                      to="/inventory/findAll"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/inventory/findAll")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      재고현황
                    </Link>
                    <Link
                      to="/orders"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/orders")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      발주
                    </Link>
                    <Link
                      to="/disposal"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/disposal")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      폐기관리
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </div>
          {/* 사이드메뉴5 */}
          <div className="relative block w-full">
            <div
              role="button"
              className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <button
                type="button"
                className="flex items-center justify-between w-full p-2 font-sans text-sm antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900 dark:text-gray-200 dark:hover:text-white"
                onClick={() => setIsGoodsOpen((prev) => !prev)}
              >
                <div className="grid mr-2 place-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <p className="block mr-auto font-sans text-sm antialiased font-normal leading-relaxed text-blue-gray-900 dark:text-gray-200">
                  상품관리
                </p>
                <span
                  className={`ml-2 transition-transform ${
                    isGoodsOpen ? "" : "rotate-180"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-3 h-3 mx-auto transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
            <div className="overflow-hidden">
              {/* 서브 메뉴: isGoodsOpen이 true일 때만 표시 */}
              {isGoodsOpen && (
                <div className="block w-full py-1 font-sans text-xs antialiased font-light leading-normal text-gray-700 dark:text-gray-300">
                  <nav className="flex min-w-0 flex-col gap-1 p-0 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-300">
                    <Link
                      to="/categories/findAll"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/categories/findAll")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      상품조회
                    </Link>
                    <Link
                      to="/goods/manage/add"
                      className={`flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start ${
                        isLinkActive("/goods/manage/add")
                          ? "bg-blue-700 text-white"
                          : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      <div className="grid mr-2 place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-3 h-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          ></path>
                        </svg>
                      </div>
                      상품등록
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
