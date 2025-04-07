import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MenuNavigation from "./../components/MenuNavigation";
import { fetchGoodsDetail } from "../api/HttpGoodsService";
import { FormatDate } from "../../disposal/components/FormatDate";

function GoodsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goods, setGoods] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDiscounting =
    goods && goods.discountRate !== null && goods.discountEndAt !== null;

  useEffect(() => {
    async function getGoodsDetail() {
      try {
        const data = await fetchGoodsDetail(id);
        setGoods(data);
        console.log("상품", data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsDetail();
  }, [id]);

  // 할인된 가격 계산
  const calculateDiscountedPrice = () => {
    if (!goods || !isDiscounting) return goods?.goods_price;
    return goods?.goods_price;
  };

  return (
    <>
      <MenuNavigation />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                상품 상세 정보
              </h2>
              <button
                onClick={() => navigate("/categories/findAll")}
                className="px-4 py-2 text-sm bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                뒤로 가기
              </button>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="p-8 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p className="font-medium">오류가 발생했습니다</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* 상품 정보 */}
          {!loading && !error && goods && (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 이미지 영역 */}
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="overflow-hidden rounded-xl shadow-lg">
                      <img
                        src={`${goods.goods_image}` || "/placeholder.svg"}
                        alt={goods.goods_name}
                        className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* 할인 배지 */}
                    {isDiscounting && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {goods.discountRate}% 할인
                      </div>
                    )}

                    {/* 재고 상태 배지 */}
                    {goods.goods_stock < 5 ? (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        재고 부족
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        재고 충분
                      </div>
                    )}
                  </div>

                  {/* 가격 정보 카드 */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">
                          판매가
                        </h3>
                        <div className="flex items-baseline mt-1">
                          {isDiscounting && (
                            <span className="text-lg line-through text-gray-400 mr-2">
                              {goods.originalPrice.toLocaleString()}원
                            </span>
                          )}
                          <span className="text-3xl font-bold text-indigo-700">
                            {(isDiscounting
                              ? calculateDiscountedPrice()
                              : goods.goods_price
                            ).toLocaleString()}
                            원
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 할인 정보 */}
                    {isDiscounting && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-center text-amber-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">할인 정보</span>
                        </div>
                        <div className="mt-1 text-sm text-amber-600">
                          <span className="font-semibold">
                            {goods.discountRate}% 할인
                          </span>
                          이
                          <span className="font-semibold ml-1">
                            {FormatDate(goods.discountEndAt)}
                          </span>{" "}
                          까지 적용됩니다.
                        </div>
                        <div className="mt-1 text-sm text-amber-600">
                          <span className="font-semibold">
                            {goods.goods_price.toLocaleString()}원
                          </span>{" "}
                          절약 가능
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 상품 정보 영역 */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {goods.goods_name}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        카테고리 ID: {goods.category_id}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        등록일: {FormatDate(goods.goods_created_at)}
                      </span>
                    </div>
                  </div>

                  {/* 상품 설명 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      상품 설명
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {goods.goods_description || "상품 설명이 없습니다."}
                    </p>
                  </div>

                  {/* 재고 정보 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      재고 정보
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            goods.goods_stock < 5
                              ? "bg-red-500"
                              : goods.goods_stock < 20
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (goods.goods_stock / 50) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-4 font-medium">
                        {goods.goods_stock}개
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {goods.goods_stock < 5
                        ? "재고가 매우 부족합니다. 빠른 보충이 필요합니다."
                        : goods.goods_stock < 20
                        ? "재고가 적절한 수준입니다."
                        : "재고가 충분합니다."}
                    </p>
                  </div>

                  {/* 추가 정보 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      추가 정보
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">상품 ID</p>
                        <p className="font-medium">{id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">상품 코드</p>
                        <p className="font-medium">PRD-{id.padStart(6, "0")}</p>
                      </div>
                    </div>
                  </div>

                  {/* 관리 버튼 */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        navigate(`/goods/edit/${id}`, {
                          state: { isDiscounting },
                        })
                      }
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      상품 수정
                    </button>
                  </div>
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
