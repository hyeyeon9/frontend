import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// 날짜에 요일 추가하여 포맷팅하는 함수
const formatDateWithDay = (date) => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayOfWeek = days[date.getDay()];

  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
};

// 날짜 포맷 함수 (date-fns의 format 함수를 간단히 구현)
const format = (date, formatStr) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  if (formatStr === "yyyy년 MM월") {
    return `${year}년 ${month}월`;
  }

  return `${year}-${month}-${String(date.getDate()).padStart(2, "0")}`;
};

const CustomDatePicker = ({
  selectedDate: externalSelectedDate,
  onChange,
  className = "",
  label = "날짜 선택",
}) => {
  // 내부 상태 관리
  const [selectedDate, setSelectedDate] = useState(
    externalSelectedDate || new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // 요일 이름 배열
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 오늘 날짜
  const today = new Date();

  // 외부 selectedDate prop이 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (externalSelectedDate) {
      setSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);

  // 날짜 선택 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
    setShowDatePicker(false);
  };

  // 외부 클릭 감지하여 달력 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 달력 렌더링 함수
  const renderCalendar = () => {
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
            onClick={() =>
              setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
            }
            className="p-1 hover:bg-gray-100 rounded-full"
            type="button"
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
            type="button"
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
                type="button"
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
            type="button"
          >
            오늘
          </button>
          <button
            onClick={() => setShowDatePicker(false)}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            type="button"
          >
            닫기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          type="button"
        >
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatDateWithDay(selectedDate)}</span>
        </button>
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CustomDatePicker;
