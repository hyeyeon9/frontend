import { useEffect, useState } from "react";
import { fetchGoodsByCategory } from "../api/HttpGoodsService";
import { Link, useParams } from "react-router-dom";
import MenuNavigation from "./../components/MenuNavigation";

function GoodsByCategory() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { firstname } = useParams();

  const [category, setCategory] = useState("");

  useEffect(() => {
    const map = {
      food: "식품",
      drink: "음료",
      household: "생활용품",
      digital: "디지털 & 문구",
    };
    if (map[firstname]) {
      setCategory(map[firstname]);
    }
  }, [firstname]);

  useEffect(() => {
    if (!category) return;
    async function getGoodsListByFirstCategory() {
      try {
        const data = await fetchGoodsByCategory(category);
        setGoodsList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsListByFirstCategory();
  }, [category]);

  return (
    <>
      <MenuNavigation />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            📁 '{category}' 상품 목록
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
                    <tr
                      key={item.goods_id}
                      className="text-center border-b hover:bg-gray-50"
                    >
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

export default GoodsByCategory;
