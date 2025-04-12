import { useEffect, useState } from "react";
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService";
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  BarChart4,
  Tag,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpiringItemsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showInsights, setShowInsights] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    async function getExpiringItems() {
      try {
        const data = await fetchExpiringItems();
        setItems(data);
        console.log("유통기한", data);
      } catch (error) {
        console.error("Failed to fetch expiring items:", error);
      }
    }
    getExpiringItems();
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // 유통기한 계산
  const getDaysUntil = (dateString) => {
    const today = new Date();
    const expirationDate = new Date(dateString);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 유통기한 정도에 따른 색상 변화
  const getBadgeVariant = (days) => {
    if (days <= 1) return "bg-red-100 text-red-800";
    if (days <= 3) return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-800";
  };

  // 선택한 상품 토글되도록
  const toggleItemSelection = (item) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.batchId === item.batchId);
      if (isSelected) {
        return prev.filter((i) => i.batchId !== item.batchId);
      } else {
        return [...prev, item];
      }
    });
  };

  // 선택한 상품 발주페이지로 이동
  const goToOrderingPage = () => {
    // localStorage에 저장해서 보내기
    localStorage.setItem(
      "selectedExpiringItems",
      JSON.stringify(selectedItems)
    );
    // window.location 사용해서 이동하기
    window.location.href = "/orders";
  };

  // 할인 페이지로 이동하는 함수
  const goToDiscountPage = () => {
    localStorage.setItem("selectedForDiscount", JSON.stringify(selectedItems));
    window.location.href = "/categories/findAll";
  };

  // 유통기한 긴급/위험/3일 이상 상품으로 필터링
  const urgentItems = items.filter(
    (item) => getDaysUntil(item.expirationDate) <= 1
  );
  const warningItems = items.filter((item) => {
    const days = getDaysUntil(item.expirationDate);
    return days > 1 && days <= 3;
  });

  // 손실값 계산하기
  const calculatePotentialLoss = () => {
    return warningItems.reduce(
      (sum, item) => sum + item.stockQuantity * item.goodsPrice,
      0
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">유통기한 임박 상품 전체 목록</h1>
        </div>

        <div className="min-h-[44px] flex items-center">
          {selectedItems.length > 0 && (
            <button
              onClick={goToOrderingPage}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>선택한 상품 발주하기 ({selectedItems.length})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showInsights && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="h-10 w-10 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">긴급 조치 필요</h3>
              <p className="text-red-700 text-sm mb-2">
                {urgentItems.length}개 상품이 1일 이내 유통기한 만료
              </p>
              <div className="flex gap-2">
                <Link to="/categories/findAll">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      goToDiscountPage();
                    }}
                    className="text-xs bg-white text-red-700 px-2 py-1 rounded border border-red-300 hover:bg-red-100 transition-colors"
                  >
                    <Tag className="h-3 w-3 inline mr-1" />
                    할인 적용
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <BarChart4 className="h-10 w-10 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">잠재적 손실</h3>
              <p className="text-amber-700 text-sm mb-2">
                약 {calculatePotentialLoss().toLocaleString()}원 상당의 상품
                폐기 예정
              </p>
              <div className="text-xs text-amber-700">
                <span className="font-medium">{warningItems.length}개</span>{" "}
                상품이 3일 이내 만료
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <TrendingUp className="h-10 w-10 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">추천 조치</h3>
              <p className="text-blue-700 text-sm mb-2">
                유통기한 임박 상품 재고 관리 방안
              </p>
              <div className="flex gap-2">
                <button
                  onClick={goToOrderingPage}
                  className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                >
                  <ShoppingCart className="h-3 w-3 inline mr-1" />
                  발주 관리
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="text-sm text-gray-600 flex items-center gap-1 hover:text-gray-800"
        >
          <Info className="h-4 w-4" />
          {showInsights ? "인사이트 숨기기" : "인사이트 보기"}
        </button>

        <div className="text-sm text-gray-600">
          총 {items.length}개의 상품이 유통기한에 임박했습니다
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">상품 목록</h2>

          <div className="flex gap-2 text-sm">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              1일 이내: {urgentItems.length}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
              3일 이내: {warningItems.length}
            </span>
          </div>
        </div>

        <div className="rounded-md">
          <div className="grid grid-cols-12 border-b bg-gray-50 px-4 py-3 text-sm font-medium">
            <div className="col-span-1 flex items-center justify-center">
              선택
            </div>
            <div className="col-span-5">상품명</div>
            <div className="col-span-2 text-center">수량</div>
            <div className="col-span-3 text-center">유통기한</div>
            <div className="col-span-1 text-right">남은 일수</div>
          </div>

          <div className="divide-y max-h-[450px] overflow-y-auto">
            {currentItems.map((item) => {
              const daysLeft = getDaysUntil(item.expirationDate);
              const badgeVariant = getBadgeVariant(daysLeft);
              const isSelected = selectedItems.some(
                (i) => i.batchId === item.batchId
              );

              return (
                <div
                  key={item.batchId}
                  className={`grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                    isSelected ? "bg-indigo-50" : ""
                  }`}
                  onClick={() => toggleItemSelection(item)}
                >
                  <div
                    className="col-span-1 flex items-center justify-center"
                    onClick={() => toggleItemSelection(item)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(item);
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-5 font-medium">{item.goodsName}</div>
                  <div className="col-span-2 text-center">
                    {item.stockQuantity}개
                  </div>
                  <div className="col-span-3 text-center">
                    {item.expirationDate.split("T")[0]}
                  </div>
                  <div className="col-span-1 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badgeVariant}`}
                    >
                      {daysLeft <= 0 ? "오늘" : `${daysLeft}일`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                page === i + 1
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
