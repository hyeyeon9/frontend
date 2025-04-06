import { useEffect, useState } from "react";
import { format, getDay } from "date-fns";
import {
  Calendar,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { Button, Spinner } from "flowbite-react";
import { fetchGetAlertListByTrend } from "../api/HttpSalesAnalysisService";
import ReportTable from "../components/ReportTable";
import TimeSelector from "../components/TimeSelector";
import ReportDetailModal from "../components/ReportDetailModal";
import SalesComparison from "../../statistics/pages/SalesComparison";

export default function SalesReport() {
  const [activeTab, setActiveTab] = useState("report"); // 기본값: 리포트
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMode, setSelectedMode] = useState(1); // 기본값을 전주 동요일 대비(1)로 설정
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeData, setSelectedTimeData] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [viewMode, setViewMode] = useState("time"); // "time" or "table"
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 조회 모드 옵션 (전체 옵션 제거)
  const modes = [
    { value: 1, label: "일주일 전 대비" },
    { value: 2, label: "1개월 전 대비" },
    { value: 3, label: "1년 전 대비" },
  ];

  // 요일 배열
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 페이지 로드 시 오늘 날짜의 전주 동요일 대비 데이터 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const formattedDate = format(new Date(), "yyyy-MM-dd");
      // 기본값을 전주 동요일 대비(1)로 설정하여 API 호출
      const response = await fetchGetAlertListByTrend(formattedDate, 1);
      setSalesData(response.data);
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // 날짜 변경 함수
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeData(null);
    setSelectedHour(null);
    setShowDetailView(false);
    setShowDatePicker(false); // 날짜 선택 후 달력 닫기
  };

  // 날짜 이동 함수 (이전/다음 날짜)
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
    setSelectedTimeData(null);
    setSelectedHour(null);
    setShowDetailView(false);
  };

  // 조회 모드 변경 함수
  const handleModeChange = (modeValue) => {
    setSelectedMode(modeValue);
    setSelectedTimeData(null);
    setSelectedHour(null);
    setShowDetailView(false);
  };

  // 데이터 조회 함수
  const handleSearch = async () => {
    setLoading(true);
    // 날짜 형식 맞추기
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    let response;

    // 항상 트렌드 API 사용 (전체 옵션 제거)
    response = await fetchGetAlertListByTrend(formattedDate, selectedMode);

    setSalesData(response.data);
    setSelectedTimeData(null);
    setSelectedHour(null);
    setShowDetailView(false);
    setLoading(false);
  };

  // 날짜 또는 조회 모드가 바뀔 때마다 자동으로 조회
  useEffect(() => {
    if (selectedDate && selectedMode !== null) {
      handleSearch();
    }
  }, [selectedDate, selectedMode]);

  // 시간 선택 함수
  const handleTimeSelect = (hour, data) => {
    setSelectedHour(hour);
    setSelectedTimeData(data);
    setShowDetailView(true);
  };

  // 모달 열기 함수 (ReportTable에서 사용)
  const handleOpenModal = (alert) => {
    setSelectedTimeData(alert);
  };

  // 뷰 모드 변경 함수
  const toggleViewMode = () => {
    setViewMode(viewMode === "time" ? "table" : "time");
    setSelectedTimeData(null);
    setSelectedHour(null);
    setShowDetailView(false);
  };

  // 현재 선택된 모드 라벨 가져오기
  const getSelectedModeLabel = () => {
    const selectedModeObj = modes.find((mode) => mode.value === selectedMode);
    return selectedModeObj ? selectedModeObj.label : "";
  };

  // 날짜 포맷팅 함수
  const formatDateWithDay = (date) => {
    const dayIndex = getDay(date);
    return `${format(date, "yyyy년 MM월 dd일")} (${dayNames[dayIndex]})`;
  };

  // 커스텀 날짜 선택기 렌더링
  const renderCustomDatePicker = () => {
    if (!showDatePicker) return null;

    const today = new Date();
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

    return (
      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-10 p-2 border border-gray-200 w-72">
        <div className="flex justify-between items-center mb-2 px-2">
          <button
            onClick={() =>
              setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
            }
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-medium">
            {format(selectedDate, "yyyy년 MM월")}
          </div>
          <button
            onClick={() =>
              setSelectedDate(new Date(currentYear, currentMonth + 1, 1))
            }
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
    <div className="bg-gray-50 min-h-screen p-6 max-w-7xl mx-auto">
      {/* 탭 네비게이션 추가 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6 text-2xl font-bold text-gray-800">
          <button
            className={`flex items-center ${
              activeTab === "report"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400 hover:text-indigo-600"
            } pb-1`}
            onClick={() => setActiveTab("report")}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            매출 레포트
          </button>
          <button
            className={`flex items-center ${
              activeTab === "comparison"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400 hover:text-indigo-600"
            } pb-1`}
            onClick={() => setActiveTab("comparison")}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            매출 비교
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "report" ? (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-800">매출 레포트</h1>
            </div>

            {/* 컴팩트한 컨트롤 영역 */}
            <div className="flex flex-col gap-4">
              {/* 첫 번째 줄: 날짜 선택 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {formatDateWithDay(selectedDate)}
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

                <div className="ml-auto">
                  <Button
                    color="light"
                    onClick={toggleViewMode}
                    className="text-sm"
                  >
                    {viewMode === "time"
                      ? "테이블 뷰로 보기"
                      : "시간별 뷰로 보기"}
                  </Button>
                </div>
              </div>

              {/* 두 번째 줄: 조회 모드 버튼 */}
              <div className="flex flex-wrap gap-2">
                {modes.map((mode) => (
                  <Button
                    key={mode.value}
                    color={selectedMode === mode.value ? "blue" : "light"}
                    onClick={() => handleModeChange(mode.value)}
                    size="sm"
                    className="flex-grow md:flex-grow-0"
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-center items-center h-64">
              <Spinner size="xl" />
            </div>
          )}

          {/* 데이터 없음 상태 */}
          {!loading && salesData.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col justify-center items-center h-64 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>조회된 매출 데이터가 없습니다.</p>
            </div>
          )}

          {/* 시간별 뷰 */}
          {!loading && salesData.length > 0 && viewMode === "time" && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                  시간대별 매출 현황
                </h2>
                <div className="text-sm font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  {getSelectedModeLabel()}
                </div>
              </div>

              <TimeSelector
                salesData={salesData}
                selectedHour={selectedHour}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          )}

          {/* 테이블 뷰 */}
          {!loading && salesData.length > 0 && viewMode === "table" && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 overflow-x-auto">
              <ReportTable salesData={salesData} onRowClick={handleOpenModal} />
            </div>
          )}

          {/* 상세 정보 영역 (시간별 뷰에서만 표시) */}
          {showDetailView && selectedTimeData && viewMode === "time" && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <ReportDetailModal
                selectedAlert={selectedTimeData}
                isInline={true}
                closeModal={() => setShowDetailView(false)}
              />
            </div>
          )}
        </>
      ) : (
        <SalesComparison />
      )}
    </div>
  );
}
