"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DisposalToday from "../../disposal/pages/DisposalToday";
import SalesToday from "../../statistics/pages/SalesToday";
import ExpiringSoonList from "./ExpiringSoonList";
import ChatWidget from "../../../components/ChatWidget";

import {
  fetchDisposal,
  fetchDisposalByDate,
} from "../../disposal/api/HttpDisposalService";
import {
  fetchExpiringItems,
  fetchInventoryList,
} from "../../inventory/api/HttpInventoryService"; // 위치 확인 필요
import {
  fetchGetTodaySales,
  fetchGetTodayVisitors,
} from "../api/DashboardService";
import { fetchOrders } from "../../ordering/api/HttpOrderingService";
import { FormatDate } from "../../disposal/components/FormatDate";

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
  // 알림 관련 상태 추가
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const [alertList, setAlertList] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  // 필터링된 알림 목록 계산
  const filteredAlerts = showUnreadOnly
    ? alertList.filter((alert) => !alert.read)
    : alertList;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showAlertDropdown &&
        !event.target.closest(".notification-dropdown")
      ) {
        setShowAlertDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAlertDropdown]);

  // 폐기 예정 상품 개수
  useEffect(() => {
    async function getDisposalCount() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const data = await fetchDisposalByDate(today);
        setDisposalCount(data.length);
      } catch (error) {
        console.error("폐기 상품 개수 불러오기 실패:", error);
      }
    }

    getDisposalCount();
  }, []);

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
        let latestData = data.sort((a, b) => b.orderId - a.orderId).slice(0, 3);

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
          <p className="text-2xl font-bold mt-1">{value}</p>
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

  // 유통기한 임박 알림
  // useEffect(() => {
  //   async function getExpiringAlerts() {
  //     try {
  //       const today = new Date();
  //       const alerts = [];

  //       expiringItems.forEach((item) => {
  //         const expDate = new Date(item.expirationDate);
  //         const timeDiff = expDate - today;
  //         const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  //         if (daysLeft <= 1 && daysLeft > 0) {
  //           const message = `⏰ '${item.goodsName}' 유통기한이 ${daysLeft}일 남았습니다. 할인 또는 폐기를 고려해주세요.`;

  //           // 중복 메시지 체크
  //           if (!alertList.some((a) => a.message === message)) {
  //             alerts.push({
  //               type: "유통기한임박",
  //               message,
  //               time: "방금 전",
  //               read: false,
  //             });
  //           }
  //         }
  //       });

  //       if (alerts.length > 0) {
  //         setAlertList((prev) => [...alerts, ...prev]);
  //       }
  //     } catch (error) {
  //       console.error("유통기한 임박 알림 생성 실패:", error);
  //     }
  //   }

  //   getExpiringAlerts();
  // }, [alertList]); // alertList 의존성 추가 (중복 방지)

  // 재고 부족 알림
  useEffect(() => {
    if (mergedLowStock.length > 0) {
      const message = `재고 5개 이하 상품이 ${mergedLowStock.length}개 있습니다. 빠른 발주가 필요해요!`;

      // 같은 메시지가 이미 있는지 확인
      const isDuplicate = alertList.some((a) => a.message === message);

      if (!isDuplicate) {
        const lowStockAlert = {
          type: "재고부족",
          message,
          time: "방금 전",
          read: false,
        };
        setAlertList((prev) => [lowStockAlert, ...prev]);
      }
    }
  }, [mergedLowStock, alertList]);

  // 자동 폐기 알림
  useEffect(() => {
    async function getAutoDisposalAlerts() {
      try {
        const response = await fetchDisposal(); // API 경로
        console.log("폐기 항목", response);

        const today = new Date().toISOString().slice(0, 10); // "2025-04-02"
        console.log("today", today);

        const autoDisposals = response.filter((item) => {
          if (item.disposal_reason !== "유통기한 만료") return false;
          const disposedDateStr = item.disposed_at.slice(0, 10);
          console.log("disposedDateStr", disposedDateStr);
          return disposedDateStr === today;
        });

        console.log("오늘 자동 폐기", autoDisposals);

        if (autoDisposals.length > 0) {
          const newAlert = {
            type: "자동폐기",
            message: `자동 폐기된 상품이 ${autoDisposals.length}개 있습니다.`,
            time: "방금 전",
            read: false,
          };

          setAlertList((prev) => {
            const isDuplicate = prev.some(
              (alert) =>
                alert.type === newAlert.type &&
                alert.message === newAlert.message
            );
            return isDuplicate ? prev : [newAlert, ...prev];
          });
        }
      } catch (e) {
        console.error("자동 폐기 알림 실패:", e);
      }
    }

    getAutoDisposalAlerts();
  }, []);

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
        {/* 알림 아이콘 */}
        <div className="relative ml-4">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setShowAlertDropdown((prev) => !prev)}
            aria-label="알림"
          >
            <svg
              className="h-6 w-6 text-gray-600 hover:text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* 읽지 않은 알림 개수 표시 */}
            {alertList.filter((alert) => !alert.read).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {alertList.filter((alert) => !alert.read).length}
              </span>
            )}
          </button>

          {/* 알림 드롭다운 */}
          {showAlertDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-800">알림</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // 읽지 않은 알림만 보기 토글
                      setShowUnreadOnly(!showUnreadOnly);
                    }}
                    className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {showUnreadOnly ? "전체 보기" : "안읽은 알림만"}
                  </button>
                  {alertList.filter((alert) => !alert.read).length > 0 && (
                    <button
                      onClick={() => {
                        // 모든 알림 읽음 처리
                        setAlertList(
                          alertList.map((alert) => ({ ...alert, read: true }))
                        );
                      }}
                      className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      모두 읽음
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-sm text-gray-500">
                    {showUnreadOnly
                      ? "읽지 않은 알림이 없습니다"
                      : "알림이 없습니다"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAlerts.map((alert, index) => {
                      // 알림 유형에 따른 배경색 설정
                      let bgColorClass = "";
                      if (alert.type === "유통기한임박")
                        bgColorClass = "bg-amber-50";
                      if (alert.type === "재고부족")
                        bgColorClass = "bg-blue-50";
                      if (alert.type === "자동폐기") bgColorClass = "bg-red-50";

                      // 아이콘 설정
                      let icon = "📢"; // 기본 아이콘
                      if (alert.type === "유통기한임박") icon = "⏰";
                      if (alert.type === "재고부족") icon = "🔥";
                      if (alert.type === "자동폐기") icon = "🚨";

                      return (
                        <div
                          key={index}
                          className={`p-4 ${bgColorClass} ${
                            !alert.read ? "bg-opacity-70" : ""
                          } hover:bg-opacity-100 transition-colors`}
                        >
                          <div className="flex gap-3">
                            <div className="text-lg flex-shrink-0">{icon}</div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  !alert.read ? "font-medium" : ""
                                } text-gray-800`}
                              >
                                {alert.message}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                  {alert.time}
                                  {alert.read && (
                                    <span className="ml-2 text-gray-400">
                                      읽음
                                    </span>
                                  )}
                                </p>
                                <button
                                  onClick={() => {
                                    // 알림 읽음/안읽음 상태 토글
                                    const updatedAlerts = [...alertList];
                                    const alertIndex = alertList.findIndex(
                                      (a, i) => filteredAlerts[index] === a
                                    );
                                    if (alertIndex !== -1) {
                                      updatedAlerts[alertIndex].read =
                                        !updatedAlerts[alertIndex].read;
                                      setAlertList(updatedAlerts);
                                    }
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                  {alert.read ? "안읽음 표시" : "읽음 표시"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
          value={`₩${sales.toLocaleString()}`}
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
                <span>27.5%</span>
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
            <select className="text-sm border rounded-md px-2 py-1">
              <option>오늘</option>
              <option>이번 주</option>
              <option>이번 달</option>
            </select>
          </div>
          <div className="h-80">
            <SalesToday />
          </div>
        </div>

        {/* 폐기/유통기한 탭 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "disposal"
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("disposal")}
            >
              폐기 처리
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
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
            {mergedLowStock.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{item.goodsName}</span>
                <div className="flex items-center">
                  <div className="w-48 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="h-full bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">
                    {item.totalStock}개
                  </span>
                </div>
              </div>
            ))}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

      {/* 챗봇 */}
      <ChatWidget />
    </div>
  );
}
