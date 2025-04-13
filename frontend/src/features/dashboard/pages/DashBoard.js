import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DisposalToday from "../../disposal/pages/DisposalToday";
import ExpiringSoonList from "./ExpiringSoonList";

import { fetchDisposalByDate } from "../../disposal/api/HttpDisposalService";
import { FormatDate } from "../../disposal/components/FormatDate";
import {
  fetchExpiringItems,
  fetchInventoryList,
} from "../../inventory/api/HttpInventoryService"; // 위치 확인 필요
import { fetchOrders } from "../../ordering/api/HttpOrderingService";
import {
  fetchGetTodaySales,
  fetchGetTodayVisitors,
} from "../api/DashboardService";
import DiffChart from "../../statistics/components/DiffChart";
import { getFormattedDateTime } from "../../../contexts/TimeContext";
import {
  fetchGetAverageSales,
  fetchGetHourlySales,
} from "../../statistics/api/HttpStatService";

// {prev}일 전 날짜
function getPreviousDayStringKST(prev) {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000; // 9시간
  const kst = new Date(now.getTime() + kstOffset);
  kst.setDate(kst.getDate() - prev);
  return kst.toISOString().slice(0, 10);
}

// 한 달 전 날짜
function getLastMonthSameDayStringKST() {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kst = new Date(now.getTime() + kstOffset);
  kst.setMonth(kst.getMonth() - 1);
  return kst.toISOString().slice(0, 10);
}

export default function DashBoard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("disposal"); // disposal 또는 expiring

  const [disposalCount, setDisposalCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);

  const [visitors, setVisitors] = useState(0);
  const [sales, setSales] = useState(0);
  const [loading, setLoading] = useState(true);

  const [orderData, setOrderData] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  const [expiringItems, setExpiringItems] = useState([]);

  // 매출 차트 조회모드와 차트 데이터
  const [chartMode, setChartMode] = useState("1"); // 1: 어제, 2: 일주일 전, 7: 7일 평균, 30: 30일 평균
  const [targetDate, setTargetDate] = useState(""); // 비교할 날짜
  const [todayData, setTodayData] = useState([]); // 오늘 날짜의 데이터
  const [targetData, setTargetData] = useState([]); // 비교할 날짜의 데이터

  // 오늘 날짜 저장
  const [today, setToday] = useState(getFormattedDateTime().date);

  // 폐기 예정 상품 개수
  useEffect(() => {
    async function getDisposalCount() {
      try {
        // const today = new Date().toISOString().split("T")[0];
        const data = await fetchDisposalByDate(today);
        setDisposalCount(data.length);
      } catch (error) {
        console.error("폐기 상품 개수 불러오기 실패:", error);
      }
    }

    getDisposalCount();
  }, [today]);

  // 유통기한 임박 상품 불러오기
  useEffect(() => {
    async function getExpiringCount() {
      try {
        const data = await fetchExpiringItems();
        console.log("유통기한 임박", data);
        setExpiringItems(data);
        setExpiringCount(data.length);
      } catch (error) {
        console.error("유통기한 임박 항목 불러오기 실패:", error);
      }
    }

    getExpiringCount();
  }, []);

  // 발주 현황
  useEffect(() => {
    async function getOrdersList() {
      try {
        const data = await fetchOrders();
        console.log("발주 리스트", data);
        const latestData = data
          .sort((a, b) => b.orderId - a.orderId)
          .slice(0, 3);

        setOrderData(latestData);
      } catch (e) {
        console.log(e.message);
      }
    }
    getOrdersList();
  }, []);

  useEffect(() => {
    const fetchTodaysData = async () => {
      setLoading(true);
      try {
        const visitorResponse = await fetchGetTodayVisitors();
        const salesResponse = await fetchGetTodaySales();
        setVisitors(visitorResponse.data);
        setSales(salesResponse.data);
      } catch (error) {
        console.error("데이터를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodaysData();
  }, []);

  // 전체 재고현황 불러오는 메서드 (리스트 변경될 때마다 가져오기)
  useEffect(() => {
    async function getInventoryList() {
      try {
        setLoading(true);
        const data = await fetchInventoryList();
        setInventoryList(data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    }
    getInventoryList();
  }, []);

  // 상품명 기준으로 재고 합치기
  const groupedStock = {};

  inventoryList.forEach((item) => {
    if (!groupedStock[item.goodsName]) {
      groupedStock[item.goodsName] = 0;
    }
    groupedStock[item.goodsName] += item.stockQuantity;
  });

  // 기준치 이하만 필터링
  const mergedLowStock = Object.entries(groupedStock)
    .filter(([_, total]) => total < 5)
    .map(([name, total]) => ({
      goodsName: name,
      totalStock: total,
    }));

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // 데이터 새로고침 로직
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // 대시보드 카드 컴포넌트
  const DashboardCard = ({
    title,
    value,
    icon,
    bgColor,
    textColor,
    footer,
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="xl:text-2xl font-bold mt-1 lg:text-xl">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <div className={`${textColor}`}>{icon}</div>
        </div>
      </div>
      {footer && <div className="flex items-center mt-4">{footer}</div>}
    </div>
  );

  // 섹션 헤더 컴포넌트
  const SectionHeader = ({ icon, title, linkTo, linkText = "더 보기" }) => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-sm text-blue-600 hover:underline flex items-center"
        >
          {linkText}
          <svg
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );

  // 매출 차트
  // 조회 모드 변경
  const handleChartModeChange = (e) => {
    setChartMode(e.target.value);
  };

  // 오늘의 매출 데이터
  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const todaySalesData = await fetchGetHourlySales(today);
        setTodayData(todaySalesData.data);
      } catch (error) {
        console.error("오늘 매출 데이터 가져오기 실패:", error);
      }
    };
    fetchTodayData();
  }, [today]); // Add today as a dependency

  // 조회 모드에 따른 차트 값 호출
  useEffect(() => {
    const fetchDataByType = async () => {
      try {
        let targetDate;
        let data;

        switch (chartMode) {
          case "1": {
            // 어제의 매출 데이터
            targetDate = getPreviousDayStringKST(1);
            data = await fetchGetHourlySales(targetDate);
            setTargetDate(targetDate);
            break;
          }
          case "2": {
            // 저번 주 같은 요일의 매출 데이터
            targetDate = getPreviousDayStringKST(7);
            data = await fetchGetHourlySales(targetDate);
            setTargetDate(targetDate);
            break;
          }
          case "7": {
            // 일주일 평균 매출 데이터 가져오기
            const endDate = getPreviousDayStringKST(1);
            const startDate = getPreviousDayStringKST(7);
            data = await fetchGetAverageSales(startDate, endDate);
            setTargetDate("최근 7일 평균");
            break;
          }
          case "30": {
            // 한달 평균 매출 데이터 가져오기
            const endDate = getPreviousDayStringKST(1);
            const startDate = getLastMonthSameDayStringKST();
            data = await fetchGetAverageSales(startDate, endDate);
            setTargetDate("최근 한 달 평균");
            break;
          }
          default:
            console.warn("알 수 없는 chartMode:", chartMode);
            return;
        }
        setTargetData(data.data);
      } catch (error) {
        console.error("차트 데이터 가져오기 실패:", error);
      }
    };

    fetchDataByType();
  }, [chartMode]);

  const barColor =
    mergedLowStock.totalStock < 2
      ? "bg-red-500"
      : mergedLowStock.totalStock < 5
      ? "bg-amber-500"
      : "bg-blue-600";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 대시보드</h1>
          <div className="flex items-center text-gray-500 mt-1">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {currentTime.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <svg
              className="h-4 w-4 ml-3 mr-1"
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
            <span>{currentTime.toLocaleTimeString("ko-KR")}</span>
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          disabled={isLoading}
        >
          <svg
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard
          title="오늘 매출"
          value={`₩${Number(sales.today || 0).toLocaleString()}`}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          footer={
            <div className="flex items-center">
              <div className="text-green-500 flex items-center">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>{sales.difference || 0}%</span>
              </div>
              <span className="text-gray-500 text-sm ml-2">어제 대비</span>
            </div>
          }
        />

        <DashboardCard
          title="폐기 처리 상품"
          value={`${disposalCount}개`}
          bgColor="bg-red-100"
          textColor="text-red-600"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          }
          footer={<span className="text-gray-500 text-sm">오늘</span>}
        />

        <DashboardCard
          title="유통기한 임박"
          value={`${expiringCount}개`}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
          footer={<span className="text-gray-500 text-sm">3일 이내</span>}
        />

        <DashboardCard
          title="오늘 방문자 수"
          value={`${visitors.toLocaleString()}명`}
          bgColor="bg-green-100"
          textColor="text-green-600"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          }
          footer={<span className="text-gray-500 text-sm"></span>}
        />
      </div>

      {/* 매출 차트와 폐기/유통기한 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 매출 차트 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">매출 추이</h2>
            <select
              className="text-sm border rounded-md px-2 py-1"
              value={chartMode}
              onChange={handleChartModeChange}
            >
              <option value={1}>전일 비교</option>
              <option value={2}>전주 비교</option>
              {/* <option value={7}>7일 평균</option>
              <option value={30}>30일 평균</option> */}
            </select>
          </div>
          <div className="xl:h-96 lg:h-80">
            {todayData.length > 0 && targetData.length > 0 && (
              <DiffChart
                todayData={todayData}
                targetDateData={targetData}
                date1={today}
                date2={targetDate}
              />
            )}
          </div>
        </div>

        {/* 폐기/유통기한 탭 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b flex-nowrap overflow-x-auto">
            <button
              className={`flex-1 py-3 px-3 md:px-4 min-w-0 whitespace-nowrap text-center font-medium text-sm md:text-base ${
                activeTab === "disposal"
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("disposal")}
            >
              폐기 처리
            </button>
            <button
              className={`flex-1 py-3 px-3 md:px-4 min-w-0 whitespace-nowrap text-center font-medium text-sm md:text-base ${
                activeTab === "expiring"
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("expiring")}
            >
              유통기한 임박
            </button>
          </div>

          <div className="p-4">
            {activeTab === "disposal" ? (
              <DisposalToday />
            ) : (
              <ExpiringSoonList />
            )}
          </div>
        </div>
      </div>

      {/* 재고 현황 및 발주 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 재고 현황 */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <SectionHeader
            icon={
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            }
            title="재고부족 현황"
            linkTo="/inventory/findAll"
          />
          <div className="space-y-4">
            {mergedLowStock.slice(0, 5).map((item, index) => {
              const percentage = Math.min(100, item.totalStock * 10);
              return (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm truncate max-w-[40%]">
                    {item.goodsName}
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 md:w-32 lg:w-40 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10 text-right">
                      {item.totalStock}개
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 발주 현황 */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <SectionHeader
            icon={
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            }
            title="최근 발주 현황"
            linkTo="/orders"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발주번호
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    수량
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderData.map((order, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ORD-{order.orderId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {FormatDate(order.orderTime).slice(0, 13)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.orderQuantity}개
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          
                         bg-green-100 text-green-800`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
