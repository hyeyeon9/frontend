import { useEffect, useState } from "react";
import { fetchGoodsList } from "../api/HttpGoodsService";
import { Link } from "react-router-dom";
import MenuNavigation from "../components/MenuNavigation";
import { FormatDate } from "../../disposal/components/FormatDate";

function GoodsList() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    async function getGoodsList() {
      try {
        const data = await fetchGoodsList();
        setGoodsList(data);
        setFilteredList(data); // 초기엔 전체 목록
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsList();
  }, []);

  function handleQuery(e) {
    const value = e.target.value;
    setQuery(value);

    const filtered = goodsList.filter((item) =>
      item.goods_name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredList(filtered);
  }

  return (
    <>
      <input
        type="text"
        placeholder="상품을 검색하세요."
        value={query}
        onChange={(e) => handleQuery(e)}
         className="w-1/2 p-2 border rounded shadow-sm"
      />

      <MenuNavigation />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            📦 상품 목록
          </h1>

          {loading && <p className="text-gray-600">로딩 중입니다...</p>}
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
                    {/* <th className="px-4 py-2">카테고리</th> */}
                    <th className="px-4 py-2">등록일</th>
                    <th className="px-4 py-2">재고</th>
                    <th className="px-4 py-2">상세보기</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item) => (
                    <tr
                      key={item.goods_id}
                      className="text-center border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{item.goods_id}</td>
                      <td className="px-4 py-2">
                        <img
                          src={item.goods_image}
                          alt={item.goods_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {item.goods_name}
                      </td>
                      <td className="px-4 py-2 text-indigo-600 font-semibold">
                        {Number(item.goods_price).toLocaleString()}원
                      </td>
                      {/* <td className="px-4 py-2">{item.category_id}</td> */}
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {FormatDate(item.goods_created_at)}
                      </td>
                      <td className="px-4 py-2">{item.goods_stock}개</td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/goods/findById/${item.goods_id}`}
                          className="text-indigo-500 hover:underline text-sm"
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

export default GoodsList;
