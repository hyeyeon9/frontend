import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function MenuNavigation() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const url = location.pathname.split("/");
    const category = url[2];

    console.log("category",category);

    setSelectedCategory(category);

    if (category === "food") {
      setSubCategories([
        { name: "즉석식품", path: "/categories/food/instantMeal" },
        { name: "라면 & 면류", path: "/categories/food/noodles" },
        {
          name: "베이커리 & 샌드위치",
          path: "/categories/food/bakerySandwich",
        },
        { name: "냉장/냉동식품", path: "/categories/food/refrigeratedFrozen" },
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

  return (
    <nav className="bg-gray-100 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* 메인 카테고리 메뉴 */}
        <ul className="flex gap-8 text-lg font-semibold">
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
              }
              to="/categories/findAll"
            >
              전체
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
              }
              to="/categories/food"
            >
              식품 
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
              }
              to="/categories/drink"
            >
              음료
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
              }
              to="/categories/household"
            >
              생활용품
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
              }
              to="/categories/digital"
            >
              디지털 & 문구
            </NavLink>
          </li>
        </ul>
      </div>

      {/* 서브 카테고리 */}
      {subCategories.length > 0 && (
        <div className="bg-white py-3 shadow-sm">
          <div className="container mx-auto">
            <ul className="flex justify-center gap-6 text-gray-600">
              {subCategories.map((item, index) => (
                <li key={index}>
                  <Link
                    className="hover:text-blue-500 transition duration-200"
                    to={item.path}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MenuNavigation;
