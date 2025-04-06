import { useEffect, useState } from "react";
import { fetchGetHourlySales } from "../api/HttpStatService";
import {
  Calendar,
  TrendingUp,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, getDay } from "date-fns";
import DiffChart from "../components/DiffChart";
import DailySalesTable from "../components/DailySalesTable";

// 날짜 포매팅 함수
function formatDateTo(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD 형식
}

export default function SalesComparison() {
  // 어제, 오늘 날짜를 비교할 기본 값으로 등록
  const today = new Date();
  const yesterday = new Date(new Date().setDate(today.getDate() - 1));

  // 비교할 날짜를 선택할 값
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(yesterday);

  // 포맷된 날짜 값
  const [formattedDate1, setFormattedDate1] = useState(formatDateTo(date1));
  const [formattedDate2, setFormattedDate2] = useState(formatDateTo(date2));

  // 비교할 두 날짜의 데이터
  const [salesData1, setSalesData1] = useState([]);
  const [salesData2, setSalesData2] = useState([]);
  const [loading, setLoading] = useState(true);

  // 날짜 선택기 상태
  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);

  // 요일 배열
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 날짜가 변경될 때마다 포맷된 날짜를 업데이트
  useEffect(() => {
    setFormattedDate1(formatDateTo(date1));
    setFormattedDate2(formatDateTo(date2));
  }, [date1, date2]);

  // 데이터를 받아서 상태에 저장
  useEffect(() => {
    const fetchGetSales = async () => {
      try {
        setLoading(true);

        // 오늘 날짜의 데이터
        const response1 = await fetchGetHourlySales(formattedDate1);
        setSalesData1(response1.data);

        // 어제 날짜의 데이터
        const response2 = await fetchGetHourlySales(formattedDate2);
        setSalesData2(response2.data);

        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
        setLoading(false);
      }
    };

    fetchGetSales();
  }, [formattedDate1, formattedDate2]);

  // 날짜 변경 함수
  const handleDateChange = (date, setDate, setShowDatePicker) => {
    setDate(date);
    setShowDatePicker(false);
  };

  // 날짜 포맷팅 함수
  const formatDateWithDay = (date) => {
    const dayIndex = getDay(date);
    return `${format(date, "yyyy년 MM월 dd일")} (${dayNames[dayIndex]})`;
  };

  // 커스텀 날짜 선택기 렌더링
  const renderCustomDatePicker = (
    selectedDate,
    setDate,
    showDatePicker,
    setShowDatePicker
  ) => {
    if (!showDatePicker) return null;

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
            onClick={() => setDate(new Date(currentYear, currentMonth - 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-medium">
            {format(selectedDate, "yyyy년 MM월")}
          </div>
          <button
            onClick={() => setDate(new Date(currentYear, currentMonth + 1, 1))}
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
                onClick={() =>
                  handleDateChange(date, setDate, setShowDatePicker)
                }
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
            onClick={() => handleDateChange(today, setDate, setShowDatePicker)}
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

  // 로딩 인디케이터 컴포넌트
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <>
      {/* 페이지 제목 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">매출 비교</h1>
        </div>

        {/* 날짜 선택 UI를 제목 바로 아래로 이동 */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            날짜 선택
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기준 날짜
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDatePicker1(!showDatePicker1);
                    setShowDatePicker2(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {formatDateWithDay(date1)}
                  </span>
                </button>
                {renderCustomDatePicker(
                  date1,
                  setDate1,
                  showDatePicker1,
                  setShowDatePicker1
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비교 날짜
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDatePicker2(!showDatePicker2);
                    setShowDatePicker1(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {formatDateWithDay(date2)}
                  </span>
                </button>
                {renderCustomDatePicker(
                  date2,
                  setDate2,
                  showDatePicker2,
                  setShowDatePicker2
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1, 2단 컨텐츠 영역 */}
        <div className="lg:col-span-2">
          {/* 차트 섹션 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              시간대별 비교
            </h2>
            {loading ? (
              <LoadingIndicator />
            ) : (
              <div className="h-80 w-full">
                <DiffChart
                  todayData={salesData1}
                  targetDateData={salesData2}
                  date1={formattedDate1}
                  date2={formattedDate2}
                />
              </div>
            )}
          </div>

          {/* 테이블 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {formattedDate1} 시간대별 매출
              </h2>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <DailySalesTable date={formattedDate1} />
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {formattedDate2} 시간대별 매출
              </h2>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <DailySalesTable date={formattedDate2} />
              )}
            </div>
          </div>
        </div>

        {/* 3단 영역 (비워둠) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            추가 정보
          </h2>
          <div className="flex justify-center items-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-center">
              <span className="block mb-2">추가 정보 영역</span>
              <span className="text-sm">향후 확장 예정</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
