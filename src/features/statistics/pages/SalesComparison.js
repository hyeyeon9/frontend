import { useEffect, useState } from "react";
import { fetchGetHourlySales } from "../api/HttpStatService";
import { Calendar, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Datepicker } from "flowbite-react";
import DiffChart from "../components/DiffChart";
import DailySalesTable from "../components/DailySalesTable";

// 날짜 포매팅 함수
function formatDateTo(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD 형식
}

// 요일 구하기
function getDayOfWeek(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
}

// 날짜 표시 포맷
function formatDisplayDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = getDayOfWeek(date);
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

export default function SalesComparison() {
  // 어제, 오늘 날짜를 비교할 기본 값으로 등록
  const today = new Date();
  const yesterday = new Date(new Date().setDate(today.getDate() - 1));

  // 비교할 날짜를 선택할 값
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(yesterday);
  const [showDate1Picker, setShowDate1Picker] = useState(false);
  const [showDate2Picker, setShowDate2Picker] = useState(false);

  // 포맷된 날짜 값
  const [formattedDate1, setFormattedDate1] = useState(formatDateTo(date1));
  const [formattedDate2, setFormattedDate2] = useState(formatDateTo(date2));

  // 비교할 두 날짜의 데이터
  const [salesData1, setSalesData1] = useState([]);
  const [salesData2, setSalesData2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 날짜가 변경될 때마다 포맷된 날짜를 업데이트
  useEffect(() => {
    setFormattedDate1(formatDateTo(date1));
    setFormattedDate2(formatDateTo(date2));
  }, [date1, date2]);

  // 날짜 선택 핸들러
  const handleDate1Change = (date) => {
    setDate1(date);
    setShowDate1Picker(false);
  };

  const handleDate2Change = (date) => {
    setDate2(date);
    setShowDate2Picker(false);
  };

  // 데이터를 받아서 상태에 저장
  useEffect(() => {
    const fetchGetSales = async () => {
      try {
        setLoading(true);
        setError(null);

        // 오늘 날짜의 데이터
        const response1 = await fetchGetHourlySales(formattedDate1);
        setSalesData1(response1.data);

        // 어제 날짜의 데이터
        const response2 = await fetchGetHourlySales(formattedDate2);
        setSalesData2(response2.data);

        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchGetSales();
  }, [formattedDate1, formattedDate2]);

  // 데이터 새로고침
  const refreshData = () => {
    setLoading(true);
    fetchGetHourlySales(formattedDate1)
      .then((response) => {
        setSalesData1(response.data);
        return fetchGetHourlySales(formattedDate2);
      })
      .then((response) => {
        setSalesData2(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
        setError(error);
        setLoading(false);
      });
  };

  // 총 매출액 계산
  const totalSales1 = salesData1.reduce(
    (sum, item) => sum + (item.dailyPrice || 0),
    0
  );
  const totalSales2 = salesData2.reduce(
    (sum, item) => sum + (item.dailyPrice || 0),
    0
  );
  const salesDiff = totalSales1 - totalSales2;
  const salesDiffPercent =
    totalSales2 !== 0 ? (salesDiff / totalSales2) * 100 : 0;

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
          📊 일일 매출 비교
        </h1>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <RefreshCw size={16} />
          <span>새로고침</span>
        </button>
      </div>

      {/* 요약 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {formatDisplayDate(date1)} 매출
          </h3>
          <p className="text-2xl font-bold">{totalSales1.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {formatDisplayDate(date2)} 매출
          </h3>
          <p className="text-2xl font-bold">{totalSales2.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">매출 변화</h3>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">
              {Math.abs(salesDiff).toLocaleString()}원
            </p>
            <div
              className={`flex items-center text-sm ${
                salesDiff >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {salesDiff >= 0 ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>{Math.abs(salesDiffPercent).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <div
            className="bg-white rounded-lg shadow p-4 border border-gray-200 cursor-pointer"
            onClick={() => setShowDate1Picker(!showDate1Picker)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-500 w-5 h-5" />
                <span className="font-medium">기준 날짜</span>
              </div>
              <span className="text-gray-700">{formatDisplayDate(date1)}</span>
            </div>
          </div>
          {showDate1Picker && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <DatePicker
                selectedDate={date1}
                onChange={handleDate1Change}
                onClose={() => setShowDate1Picker(false)}
              />
            </div>
          )}
        </div>
        <div className="relative">
          <div
            className="bg-white rounded-lg shadow p-4 border border-gray-200 cursor-pointer"
            onClick={() => setShowDate2Picker(!showDate2Picker)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-500 w-5 h-5" />
                <span className="font-medium">비교 날짜</span>
              </div>
              <span className="text-gray-700">{formatDisplayDate(date2)}</span>
            </div>
          </div>
          {showDate2Picker && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <DatePicker
                selectedDate={date2}
                onChange={handleDate2Change}
                onClose={() => setShowDate2Picker(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">시간대별 매출 비교</h2>
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-80 text-red-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        ) : (
          <DiffChart
            todayData={salesData1}
            targetDateData={salesData2}
            date1={formatDisplayDate(date1)}
            date2={formatDisplayDate(date2)}
          />
        )}
      </div>

      {/* Table Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {formatDisplayDate(date1)} 시간대별 매출
          </h2>
          <DailySalesTable date={formattedDate1} />
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {formatDisplayDate(date2)} 시간대별 매출
          </h2>
          <DailySalesTable date={formattedDate2} />
        </div>
      </div>
    </div>
  );
}

// 간단한 DatePicker 컴포넌트
function DatePicker({ selectedDate, onChange, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="select-none">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronDown className="rotate-90 w-5 h-5" />
        </button>
        <h3 className="font-medium">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronDown className="rotate-270 w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <button
                onClick={() => onChange(date)}
                className={`w-full h-full flex items-center justify-center text-sm rounded-full
                ${
                  isSelected(date)
                    ? "bg-blue-500 text-white"
                    : isToday(date)
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => onChange(new Date())}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          오늘
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
