import { useEffect, useState } from "react";
import { fetchGoodsBySubCategory } from "../api/HttpGoodsService";
import { Link, useParams } from "react-router-dom";
import MenuNavigation from "./../components/MenuNavigation";

function GoodsBySubCategory() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const { firstname, secondname } = useParams();
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  useEffect(() => {
    const map = {
      instantMeal: ["식품", "즉석식품"],
      noodles: ["식품", "라면 & 면류"],
      bakerySandwich: ["식품", "베이커리 & 샌드위치"],
      refrigeratedFrozen: ["식품", "냉장 & 냉동식품"],
      snacks: ["식품", "과자 & 스낵"],
      icecreamDessert: ["식품", "아이스크림 & 디저트"],
      coffeeTea: ["음료", "커피 & 차"],
      carbonatedDrinks: ["음료", "탄산음료"],
      juiceHealth: ["음료", "주스 & 건강음료"],
      dairySoymilk: ["음료", "유제품 & 두유"],
      alcohol: ["음료", "주류"],
      hygieneProducts: ["생활용품", "위생용품"],
      bathroomSupplies: ["생활용품", "욕실용품"],
      beautyCosmetics: ["생활용품", "뷰티 & 화장품"],
      medicineHealth: ["생활용품", "의약 & 건강"],
      electronicsAccessories: ["디지털 & 문구", "전자기기 & 액세서리"],
      stationery: ["디지털 & 문구", "문구류"],
    };
    if (map[secondname]) {
      const [cat, subcat] = map[secondname];
      setCategory(cat);
      setSubCategory(subcat);
    }
  }, [secondname]);

  useEffect(() => {
    if (!subCategory) return;
    async function getGoodsListBySecondCategory() {
      try {
        const data = await fetchGoodsBySubCategory(category, subCategory);
        setGoodsList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsListBySecondCategory();
  }, [subCategory]);

  return (
    <>
      <MenuNavigation />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            📂 '{category} - {subCategory}' 상품 목록
          </h2>

          {loading && <p className="text-gray-500">로딩 중입니다...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">이미지</th>
                    <th className="px-4 py-2">상품명</th>
                    <th className="px-4 py-2">가격</th>
                    <th className="px-4 py-2">등록일</th>
                    <th className="px-4 py-2">재고</th>
                    <th className="px-4 py-2">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {goodsList.map((item) => (
                    <tr key={item.goods_id} className="text-center border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.goods_id}</td>
                      <td className="px-4 py-2">
                        <img
                          src={item.goods_image}
                          alt={item.goods_name}
                          className="w-16 h-16 object-cover rounded shadow"
                        />
                      </td>
                      <td className="px-4 py-2 font-semibold text-gray-800">
                        {item.goods_name}
                      </td>
                      <td className="px-4 py-2 text-indigo-600 font-medium">
                        {Number(item.goods_price).toLocaleString()}원
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {item.goods_created_at}
                      </td>
                      <td className="px-4 py-2">{item.goods_stock}개</td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/goods/findById/${item.goods_id}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          보기
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GoodsBySubCategory;
