import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MenuNavigation from "../components/MenuNavigation";
import {
  cancelDiscount,
  discountGoods,
  fetchGoodsDetail,
  updateGoods,
} from "../api/HttpGoodsService";

function GoodsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goods, setGoods] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 할인율을 위한 상태
  const [discountRate, setDiscountRate] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPeriod, setDiscountPeriod] = useState("7");

  const isDiscounting =
    goods?.discountRate !== null && goods?.discountEndAt !== null;

  useEffect(() => {
    async function getGoodsDetail() {
      try {
        const data = await fetchGoodsDetail(id);
        console.log(data);
        setGoods(data);
        setNewPrice(data.goods_price);
        setOriginalPrice(data.goods_price);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsDetail();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (discountRate) {
        await discountGoods(id, discountRate, discountPeriod);
      } else {
        await updateGoods(id, newPrice);
      }

      // 성공 시 상세 페이지로 돌아가기
    } catch (error) {
      setError(error.message);
      setIsSaving(false);
    } finally {
      alert("가격이 성공적으로 수정되었습니다.");
      navigate(`/goods/findById/${id}`);
    }
  };

  const handleCancel = () => {
    navigate(`/goods/findById/${id}`);
  };

  function handleDiscountChange(e) {
    const rate = Number.parseInt(e.target.value);
    console.log("rate", rate);
    setDiscountRate(rate);

    if (rate) {
      const discounted = Math.floor(originalPrice * (1 - rate / 100));
      console.log("discounted", discounted);
      setNewPrice(discounted);
    } else {
      setNewPrice(originalPrice);
    }
  }

  function handleNewPriceChange(e) {
    setNewPrice(e.target.value);
    setDiscountRate(""); // ✅ 할인율 초기화
  }

  async function handleCancelDiscount() {
    try {
      await cancelDiscount(id);
    } catch (error) {
    } finally {
      setDiscountRate("");
      setDiscountPeriod("");
      navigate(`/goods/findById/${id}`);
    }
  }

  // 할인 금액 계산
  const calculateSavings = () => {
    if (!discountRate || !originalPrice) return 0;
    return originalPrice - Math.floor(originalPrice * (1 - discountRate / 100));
  };

  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  return (
    <>
      <MenuNavigation />
      <div className="p-6 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                상품 가격 수정
              </h2>
              <button
                onClick={handleCancel}
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
                상세 페이지로 돌아가기
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p className="font-medium">오류가 발생했습니다</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && goods && (
            <div className="p-8">
              {/* 상품 기본 정보 */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/3">
                  <div className="relative group">
                    <img
                      src={`${goods.goods_image}` || "/placeholder.svg"}
                      alt={goods.goods_name}
                      className="w-full h-64 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                    />
                    {goods.goods_stock < 5 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        재고 부족
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {goods.goods_name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        카테고리 ID: {goods.category_id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          goods.goods_stock < 5
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        재고: {goods.goods_stock}개
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-lg font-medium text-gray-700">
                      현재 가격
                    </div>
                    <div className="text-3xl font-bold text-indigo-700 mt-1">
                      {formatNumber(goods.goods_price)}
                      <span className="text-lg text-gray-500 ml-1">원</span>
                    </div>

                    {isDiscounting && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
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
                          <span className="font-medium">현재 할인 진행 중</span>
                        </div>
                        <div className="mt-1 text-sm text-amber-600">
                          <span className="font-semibold">
                            {goods.discountRate}% 할인
                          </span>
                          이
                          <span className="font-semibold ml-1">
                            {goods.discountEndAt}
                          </span>{" "}
                          까지 적용됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 가격 수정 폼 */}
              <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    가격 수정
                  </h4>

                  {!isDiscounting && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            할인율 선택
                          </label>
                          <div className="flex gap-3">
                            {[0, 20, 30, 50].map((rate) => (
                              <label
                                key={rate || "none"}
                                className={`flex-1 cursor-pointer relative`}
                              >
                                <input
                                  type="radio"
                                  name="discountRate"
                                  value={rate}
                                  checked={discountRate === rate}
                                  onChange={(e) => handleDiscountChange(e)}
                                  className="sr-only"
                                />
                                <div
                                  className={`text-center py-3 px-2 rounded-md border-2 transition-all ${
                                    discountRate === rate
                                      ? "border-indigo-500 bg-indigo-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  {rate === 0 ? "기본" : `${rate}%`}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {discountRate > 0 && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              할인 기간
                            </label>
                            <select
                              value={discountPeriod}
                              onChange={(e) =>
                                setDiscountPeriod(e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="1">당일</option>
                              <option value="2">2일</option>
                              <option value="3">3일</option>
                              <option value="7">7일</option>
                              <option value="30">1달</option>
                              {/* <option value="1">테스트용 1분</option> */}
                            </select>
                          </div>
                        )}
                      </div>

                      {discountRate > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-green-800 font-medium">
                                할인 적용 가격
                              </div>
                              <div className="text-2xl font-bold text-green-700 mt-1">
                                {formatNumber(
                                  Math.floor(
                                    originalPrice * (1 - discountRate / 100)
                                  )
                                )}
                                <span className="text-base text-green-600 ml-1">
                                  원
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-800 font-medium">
                                고객 절약 금액
                              </div>
                              <div className="text-xl font-bold text-green-700 mt-1">
                                {formatNumber(calculateSavings())}
                                <span className="text-base text-green-600 ml-1">
                                  원
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!discountRate && (
                    <div className="space-y-2 mt-6">
                      <label
                        htmlFor="newPrice"
                        className="block text-sm font-medium text-gray-700"
                      >
                        새 가격 직접 입력
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          id="newPrice"
                          value={newPrice}
                          onChange={handleNewPriceChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        <span className="ml-2 text-gray-500">원</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>

                  {isDiscounting ? (
                    <button
                      type="button"
                      className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                      onClick={handleCancelDiscount}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
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
                      할인 취소
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          가격 수정 저장
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GoodsEdit;
