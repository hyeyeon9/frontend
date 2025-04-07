"use client";

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function MenuNavigation() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const url = location.pathname.split("/");
    const category = url[2];

    console.log("category", category);

    setSelectedCategory(category);

    if (category === "food") {
      setSubCategories([
        { name: "즉석식품", path: "/categories/food/instantMeal" },
        { name: "라면 & 면류", path: "/categories/food/noodles" },
        {
          name: "베이커리 & 샌드위치",
          path: "/categories/food/bakerySandwich",
        },
        {
          name: "냉장 & 냉동식품",
          path: "/categories/food/refrigeratedFrozen",
        },
        { name: "과자 & 스낵", path: "/categories/food/snacks" },
        {
          name: "아이스크림 & 디저트",
          path: "/categories/food/icecreamDessert",
        },
      ]);
    } else if (category === "drink") {
      setSubCategories([
        { name: "커피 & 차", path: "/categories/drink/coffeeTea" },
        { name: "탄산음료", path: "/categories/drink/carbonatedDrinks" },
        { name: "주스 & 건강음료", path: "/categories/drink/juiceHealth" },
        { name: "유제품 & 두유", path: "/categories/drink/dairySoymilk" },
        { name: "주류", path: "/categories/drink/alcohol" },
      ]);
    } else if (category === "household") {
      setSubCategories([
        { name: "위생용품", path: "/categories/household/hygieneProducts" },
        { name: "욕실용품", path: "/categories/household/bathroomSupplies" },
        {
          name: "뷰티 & 화장품",
          path: "/categories/household/beautyCosmetics",
        },
        { name: "의약 & 건강", path: "/categories/household/medicineHealth" },
      ]);
    } else if (category === "digital") {
      setSubCategories([
        {
          name: "전자기기 & 액세서리",
          path: "/categories/digital/electronicsAccessories",
        },
        { name: "문구류", path: "/categories/digital/stationery" },
      ]);
    } else if (category === "/" || category === "findAll") {
      setSubCategories([]);
    }
  }, [location]);

  // 카테고리 아이콘 매핑
  const categoryIcons = {
    findAll: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
    food: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    drink: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    household: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    digital: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  };

  return (
    <div className="sticky top-0 z-[50]">
      {/* 메인 네비게이션 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <p className="text-xl font-bold text-indigo-600">무인매장</p>
              </div>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">메뉴 열기</span>
                {isMobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* 데스크탑 메뉴 */}
            <div className="hidden md:flex md:items-center">
              <div className="flex space-x-4">
                <NavLink
                  to="/categories/findAll"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 flex items-center"
                      : "px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
                  }
                >
                  {categoryIcons.findAll}
                  <span className="ml-2">전체</span>
                </NavLink>

                <NavLink
                  to="/categories/food"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 flex items-center"
                      : "px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
                  }
                >
                  {categoryIcons.food}
                  <span className="ml-2">식품</span>
                </NavLink>

                <NavLink
                  to="/categories/drink"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 flex items-center"
                      : "px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
                  }
                >
                  {categoryIcons.drink}
                  <span className="ml-2">음료</span>
                </NavLink>

                <NavLink
                  to="/categories/household"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 flex items-center"
                      : "px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
                  }
                >
                  {categoryIcons.household}
                  <span className="ml-2">생활용품</span>
                </NavLink>

                <NavLink
                  to="/categories/digital"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 flex items-center"
                      : "px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
                  }
                >
                  {categoryIcons.digital}
                  <span className="ml-2">디지털 & 문구</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/categories/findAll"
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 flex items-center"
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {categoryIcons.findAll}
              <span className="ml-2">전체</span>
            </NavLink>

            <NavLink
              to="/categories/food"
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 flex items-center"
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {categoryIcons.food}
              <span className="ml-2">식품</span>
            </NavLink>

            <NavLink
              to="/categories/drink"
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 flex items-center"
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {categoryIcons.drink}
              <span className="ml-2">음료</span>
            </NavLink>

            <NavLink
              to="/categories/household"
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 flex items-center"
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {categoryIcons.household}
              <span className="ml-2">생활용품</span>
            </NavLink>

            <NavLink
              to="/categories/digital"
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 flex items-center"
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 flex items-center"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {categoryIcons.digital}
              <span className="ml-2">디지털 & 문구</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* 서브 카테고리 */}
      {subCategories.length > 0 && (
        <div className="bg-gray-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 overflow-x-auto">
              <div className="flex space-x-6 whitespace-nowrap">
                {subCategories.map((item, index) => (
                  <Link
                    key={index}
                    className="text-sm text-gray-600 hover:text-indigo-600 hover:underline transition-colors py-1 px-2 rounded-md hover:bg-gray-100"
                    to={item.path}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuNavigation;
