import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MenuNavigation from "./../components/MenuNavigation";
import { fetchGoodsDetail } from "../api/HttpGoodsService";

function GoodsDetail() {
  const { id } = useParams();
  const [goods, setGoods] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getGoodsDetail() {
      try {
        const data = await fetchGoodsDetail(id);
        setGoods(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsDetail();
  }, [id]);

  return (
    <>
      <MenuNavigation />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">
            📄 상품 상세 정보
          </h2>

          {loading && <p className="text-gray-600">로딩 중입니다...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && goods && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 이미지 영역 */}
              <div className="flex justify-center items-center">
                <img
                  src={goods.goods_image}
                  alt={goods.goods_name}
                  className="w-[280px] h-[280px] object-cover border rounded-lg shadow"
                />
              </div>

              {/* 정보 영역 */}
              <div className="space-y-3 text-gray-800">
                <div>
                  <span className="font-semibold text-gray-600">카테고리 ID:</span>{" "}
                  {goods.category_id}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">상품명:</span>{" "}
                  {goods.goods_name}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">가격:</span>{" "}
                  {goods.goods_price.toLocaleString()}원
                </div>
                <div>
                  <span className="font-semibold text-gray-600">설명:</span>{" "}
                  {goods.goods_description}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">재고:</span>{" "}
                  {goods.goods_stock}개
                </div>
                <div>
                  <span className="font-semibold text-gray-600">등록일:</span>{" "}
                  {goods.goods_created_at}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GoodsDetail;
