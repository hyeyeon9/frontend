import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Info,
  Link,
  X,
  Package,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchConfirmArrival, fetchOrders } from "../api/HttpOrderingService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function OrderingList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrders, setSelectedOrders] = useState({});

  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderSortOption, setOrderSortOption] = useState("");

  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);

  // 커스텀 날짜 선택기 렌더링 함수 추가
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [orders, setOrders] = useState([]);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [orderDateFilter, setOrderDateFilter] = useState(getTodayString());

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 발주 리스트 가져오기
  useEffect(() => {
    async function getOrdersList() {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setFilteredOrders(data);
        console.log("발주 리스트", data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getOrdersList();
  }, []);

  // 발주 리스트 필터링
  useEffect(() => {
    let filtered = [...orders];

    // 7. 날짜 필터링
    if (orderDateFilter) {
      filtered = filtered.filter((order) =>
        order.scheduledTime.startsWith(orderDateFilter)
      );
    }

    // 검색어 필터링
    if (orderSearchQuery.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.goodsName
            ?.toLowerCase()
            .includes(orderSearchQuery.toLowerCase()) ||
          order.orderId?.toString().includes(orderSearchQuery)
      );
    }

    // 상태 필터링
    if (orderStatusFilter) {
      filtered = filtered.filter((order) => order.status === orderStatusFilter);
    }

    // 정렬
    if (orderSortOption === "date_desc") {
      filtered.sort(
        (a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime)
      );
    } else if (orderSortOption === "date_asc") {
      filtered.sort(
        (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
      );
    } else if (orderSortOption === "quantity_desc") {
      filtered.sort((a, b) => b.orderQuantity - a.orderQuantity);
    } else if (orderSortOption === "quantity_asc") {
      filtered.sort((a, b) => a.orderQuantity - b.orderQuantity);
    }

    setFilteredOrders(filtered);
  }, [
    orders,
    orderSearchQuery,
    orderStatusFilter,
    orderSortOption,
    orderDateFilter,
  ]);

  // 엑셀로 내보내기
  const exportOrdersToExcel = () => {
    setShowExcelModal(false);

    const data = filteredOrders.map((order) => ({
      주문번호: order.orderId,
      상품명: order.goodsName,
      수량: order.orderQuantity,
      주문시간: formatDate(order.scheduledTime),
      상태: order.status,
    }));

    // data 배열은 엑셀에서 사용할 수 있는 시트 형식으로 변환
    // xlsx 라이브러리의 기능으로, json을 바로 시트로 만들 수 있음
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 엑셀 파일(워크북) 생성, 여러개의 시트를 포함 가능
    const workbook = XLSX.utils.book_new();

    // 위에서 만든 시트를 워크북에 추가 / 이름은 발주리스트
    XLSX.utils.book_append_sheet(workbook, worksheet, "발주 리스트");

    // 워크북을 .xlsx 형식의 버퍼로 변환
    // JavaScript ArrayBuffer 로 결과를 받겠다는 의미
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // ArrayBuffer를 Blob(파일 객체)로 감쌈
    // 파일로 다운로드하려면 Blob 형태로 만들어야 함
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // file-saver 라이브러리의 saveAs 를 이용해서 파일 다운로드 실행
    // 파일이름은 "발주_리스트_2025-04-02.xlsx" 느낌
    saveAs(blob, `발주_리스트_${orderDateFilter}.xlsx`);
  };

  // 발주 상태에 따른 배지 색상 및 아이콘
  const getStatusBadge = (status) => {
    switch (status) {
      case "입고완료":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            입고완료
          </span>
        );
      case "발주 진행중":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            발주 진행중
          </span>
        );
      case "발주완료":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            발주완료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // 전체 선택
  const handleSelectAllOrders = (e) => {
    const isChecked = e.target.checked;
    setSelectAllChecked(isChecked);

    const newSelectedOrders = {};

    // Only select orders with "발주완료" status
    filteredOrders.forEach((order) => {
      if (order.status === "발주완료") {
        newSelectedOrders[order.orderId] = isChecked;
      }
    });

    setSelectedOrders(newSelectedOrders);
  };

  //선택된 발주 개수
  const getSelectedOrdersCount = () => {
    return Object.entries(selectedOrders).filter(
      ([_, isSelected]) => isSelected
    ).length;
  };

  // 날짜 이동 함수 추가
  const navigateDate = (direction) => {
    const newDate = new Date(
      orderDateFilter ? new Date(orderDateFilter) : new Date()
    );
    newDate.setDate(newDate.getDate() + direction);

    // YYYY-MM-DD 형식으로 변환
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    setOrderDateFilter(`${year}-${month}-${day}`);
  };

  // 날짜 포맷팅 함수 추가 (요일 포함)
  const formatDateWithDay = (date) => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayIndex = date.getDay();
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}월 ${String(date.getDate()).padStart(2, "0")}일 (${dayNames[dayIndex]})`;
  };

  // 선택된 발주 상품들
  const getSelectedOrderIds = () => {
    return Object.entries(selectedOrders)
      .filter(([_, isSelected]) => isSelected)
      .map(([orderId, _]) => Number(orderId));
  };

  // Update the batch confirmation function to show a modal first
  const confirmBatchArrival = async () => {
    const selectedIds = getSelectedOrderIds();

    if (selectedIds.length === 0) {
      alert("선택된 발주가 없습니다.");
      return;
    }

    // 검수 모달
    setShowBatchInspectionModal(true);
  };

  // 검수 확인 작업
  const processBatchArrival = async () => {
    setShowBatchInspectionModal(false);
    const selectedIds = getSelectedOrderIds();

    try {
      for (const orderId of selectedIds) {
        await fetchConfirmArrival(orderId);
      }

      const updated = await fetchOrders();
      setOrders(updated);
      setFilteredOrders(updated);
      setSelectedOrders({});
      setSelectAllChecked(false);

      alert(`${selectedIds.length}개의 발주가 검수 완료되었습니다.`);
    } catch (error) {
      console.error("일괄 입고 확인 실패", error);
      alert("일괄 검수 처리 중 오류가 발생했습니다.");
    }
  };

  // 검수확인 모달
  const [showBatchInspectionModal, setShowBatchInspectionModal] =
    useState(false);

  // 검수하기 버튼
  const confirmArrival = async (orderId) => {
    setShowInspectionModal(false);
    try {
      // 서버에서 상태 변경
      await fetchConfirmArrival(orderId);

      // 전체 발주 리스트 받아오기
      const updated = await fetchOrders();

      // 방금 바뀐 주문 객체를 찾는다
      const changedOrder = updated.find((o) => o.orderId === orderId);

      if (!changedOrder) {
        console.error("업데이트된 주문 정보를 찾을 수 없습니다.");
        return;
      }

      // 상태가 변한 행만 교체하기
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? changedOrder : o))
      );

      setFilteredOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? changedOrder : o))
      );
    } catch (error) {
      console.error("입고 확인 실패", error);
    }
  };

  const renderCustomDatePicker = () => {
    if (!showDatePicker) return null;

    const today = new Date();
    const selectedDate = orderDateFilter
      ? new Date(orderDateFilter)
      : new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // 현재 월의 첫 날과 마지막 날
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // 달력에 표시할 날짜 배열 생성
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 1: 월요일, ...

    // 이전 달의 날짜들 (달력 첫 주 채우기)
    const prevMonthDays = [];
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }

    // 다음 달의 날짜들 (달력 마지막 주 채우기)
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells =
      Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed;
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    // 모든 날짜 합치기
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    // 주 단위로 분할
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // 날짜 선택 함수
    const handleDateChange = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setOrderDateFilter(`${year}-${month}-${day}`);
      setShowDatePicker(false);
    };

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    return (
      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-10 p-2 border border-gray-200 w-72">
        <div className="flex justify-between items-center mb-2 px-2">
          <button
            onClick={() => {
              const newDate = new Date(currentYear, currentMonth - 1, 1);
              handleDateChange(newDate);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-medium">{`${currentYear}년 ${
            currentMonth + 1
          }월`}</div>
          <button
            onClick={() => {
              const newDate = new Date(currentYear, currentMonth + 1, 1);
              handleDateChange(newDate);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((dayObj, index) => {
            const { date, isCurrentMonth } = dayObj;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected =
              selectedDate &&
              date.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateChange(date)}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm
                  ${isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                  ${isToday ? "bg-blue-100" : ""}
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between border-t pt-2">
          <button
            onClick={() => handleDateChange(today)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            오늘
          </button>
          <button
            onClick={() => setShowDatePicker(false)}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen -mt-3 relative">
      <div className="max-w-7xl mx-auto ">
        {/* 네비게이션 탭 */}
        <button
          onClick={() => setShowExcelModal(true)}
          className="absolute top-[90px] right-[24px]  flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          엑셀로 내보내기
        </button>

        {/* 발주 리스트 검색 및 필터 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* 첫 번째 줄: 날짜, 검색, 정렬 */}
            <div className="grid grid-cols-12 gap-4">
              {/* 날짜 필터 (왼쪽) */}
              <div className="col-span-4 flex items-center gap-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="relative flex-grow">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center gap-2 xl:px-4 py-2 lg:px-2 lg:pl-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Calendar className="h-4 w-4 text-gray-500 lg:hidden" />
                    <span className="font-bold lg:text-[15px] xl:pl-12">
                      {orderDateFilter
                        ? formatDateWithDay(new Date(orderDateFilter))
                        : formatDateWithDay(new Date())}
                    </span>
                  </button>
                  {renderCustomDatePicker()}
                </div>

                <button
                  onClick={() => navigateDate(1)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* 검색창 (중간 - 더 길게) */}
              <div className="col-span-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="상품명 또는 주문번호로 검색"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* 정렬 옵션 (오른쪽 - 짧게) */}
              <div className="col-span-2">
                <select
                  value={orderSortOption}
                  onChange={(e) => setOrderSortOption(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                >
                  <option value="date_desc">최신순</option>
                  <option value="date_asc">오래된순</option>
                  <option value="quantity_desc">수량 많은순</option>
                  <option value="quantity_asc">수량 적은순</option>
                </select>
              </div>
            </div>

            {/* 두 번째 줄: 상태 필터 버블 */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setOrderStatusFilter("")}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    orderStatusFilter === ""
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setOrderStatusFilter("발주 진행중")}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    orderStatusFilter === "발주 진행중"
                      ? "bg-white text-yellow-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  발주 진행중
                </button>
                <button
                  onClick={() => setOrderStatusFilter("발주완료")}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    orderStatusFilter === "발주완료"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  발주 완료
                </button>
                <button
                  onClick={() => setOrderStatusFilter("입고완료")}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    orderStatusFilter === "입고완료"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  입고완료
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 일괄 검수 버튼 */}
        {getSelectedOrdersCount() > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                {getSelectedOrdersCount()}개 선택됨
              </span>
            </div>
            <button
              onClick={confirmBatchArrival}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              선택한 발주 일괄 검수 확인
            </button>
          </div>
        )}

        {/* 발주 리스트 테이블 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <Info className="h-12 w-12 mb-2 text-gray-400" />
              <p>표시할 발주 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={handleSelectAllOrders}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="xl:px-6 py-3 lg:px-4 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문번호
                    </th>
                    <th className="xl:px-6 py-3 lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품명
                    </th>
                    <th className="xl:px-6 py-3 lg:px-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수량
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        주문시간
                      </div>
                    </th>
                    <th className="xl:px-6 py-3 lg:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      검수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders[order.orderId] || false}
                          onChange={() => handleSelectOrder(order.orderId)}
                          disabled={order.status !== "발주완료"}
                          className={`h-4 w-4 focus:ring-indigo-500 border-gray-300 rounded ${
                            order.status === "발주완료"
                              ? "text-indigo-600 cursor-pointer"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                        />
                      </td>
                      <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td
                        onClick={() => handleSelectOrder(order.orderId)}
                        className="xl:px-6 py-4 lg:px-4 whitespace-nowrap cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={
                                `${order.goodsImage || "/placeholder.svg"}` ||
                                "/placeholder.svg"
                              }
                              alt={order.goodsName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.goodsName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="xl:px-6 py-4 lg:px-3 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-semibold text-indigo-600">
                          {order.orderQuantity}개
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.scheduledTime)}
                      </td>
                      <td className="xl:px-6 py-4 lg:px-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.status === "발주완료" && (
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.orderId);
                              setShowInspectionModal(true);
                            }}
                            className="xl:px-3 lg:px-2 lg:pl-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            <span className="lg:hidden xl:inline">
                              {" "}
                              검수 확인
                            </span>
                          </button>
                        )}
                        {order.status === "입고완료" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            검수완료
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 엑셀 내보내기 확인 모달 */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-green-50 p-6 border-b border-green-100">
              <div className="flex items-center">
                <Download className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">
                  엑셀 내보내기
                </h3>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      발주 리스트 다운로드
                    </h4>
                    <p className="text-sm text-gray-600">
                      현재 필터링된 {filteredOrders.length}개의 발주 내역을 엑셀
                      파일로 내보냅니다.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">파일 형식:</span>
                    <span className="font-medium text-gray-800">
                      Excel (.xlsx)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">발주 내역 수:</span>
                    <span className="font-bold text-green-700">
                      {filteredOrders.length}개
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    발주 리스트를 엑셀 파일로 내보내시겠습니까?
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={exportOrdersToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 각 상품 검수 확인 모달 */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg max-w-md  w-full mx-4 shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">검수 확인</h3>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      발주 검수 완료
                    </h4>
                    <p className="text-sm text-gray-600">
                      주문번호 #{selectedOrderId}의 발주 상품이 정상
                      입고되었나요?
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      검수 확인 후에는 상태가 '입고완료'로 변경되며, 이 작업은
                      되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    검수 완료 처리를 진행하시겠습니까?
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={() => confirmArrival(selectedOrderId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                검수 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검수 확인 모달 */}
      {showBatchInspectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg w-[500px] h-[400px] shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">
                  일괄 검수 확인
                </h3>
              </div>
            </div>

            {/* Modal Content - 내용 영역에 고정 높이와 스크롤 설정 */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      발주 일괄 검수 완료
                    </h4>
                    <p className="text-sm text-gray-600">
                      선택한 {getSelectedOrdersCount()}개의 발주 상품이 정상
                      입고되었나요?
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      검수 확인 후에는 상태가 '입고완료'로 변경되며, 이 작업은
                      되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    선택한 {getSelectedOrdersCount()}개 발주의 검수 완료 처리를
                    진행하시겠습니까?
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowBatchInspectionModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                취소
              </button>
              <button
                onClick={processBatchArrival}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                일괄 검수 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderingList;
