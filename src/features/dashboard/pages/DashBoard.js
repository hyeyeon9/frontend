import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ShoppingCart, Users } from "lucide-react";
import ExpiringSoonList from "./ExpiringSoonList";
import SalesToday from "../../statistics/pages/SalesToday";

export default function Dashboard() {
  // 하드코딩 데이터
  const todaySales = 1250000;
  const lastWeekSales = 1100000;
  const percentChange = ((todaySales - lastWeekSales) / lastWeekSales) * 100;
  const isIncrease = percentChange > 0;
  const visitors = 245;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">📊 대시보드</h1>

      {/* 상단 위젯 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 오늘의 매출 */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow h-full">
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            오늘의 누적 매출
          </h2>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">
              {todaySales.toLocaleString()}원
            </p>
            <div
              className={`flex items-center text-sm ${
                isIncrease ? "text-green-600" : "text-red-600"
              }`}
            >
              {isIncrease ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{Math.abs(percentChange).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">지난주 동요일 대비</p>
        </div>

        {/* 오늘의 방문자 */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow h-full">
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            오늘 방문자 수
          </h2>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <p className="text-2xl font-bold">{visitors}명</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">최근 업데이트: 방금 전</p>
        </div>

        {/* 유통기한 임박 상품 */}
        <div className="lg:col-span-2">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow h-full">
            <h2 className="text-lg font-semibold mb-2 text-red-700">
              ⏰ 유통기한 임박 상품
            </h2>
            <ExpiringSoonList />
            <div className="mt-2 text-right">
              <Link
                to="/expiring-items"
                className="text-blue-600 text-sm hover:underline"
              >
                전체 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 중간 차트 영역 (2/3 차지) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">시간대별 매출 비교</h2>
          <SalesToday />
        </div>

        {/* 오른쪽 1/3 영역 */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">현재 시간대 인기 상품</h2>
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-80"></div>

          {/* 현재 시간대 인기 상품 */}
          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-500 mb-1">
              인기 상품
            </h2>

            <div className="mt-2 text-right">
              <Link
                to="/cart-analysis"
                className="text-blue-600 text-sm hover:underline"
              >
                분석 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 추가 정보 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">카테고리별 매출 비중</h2>
          <div className="h-64"></div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">최근 알림</h2>
          <ul className="space-y-3"></ul>
          <div className="mt-3 text-right">
            <Link
              to="/notifications"
              className="text-blue-600 text-sm hover:underline"
            >
              모든 알림 보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
