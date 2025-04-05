import { useMemo, useState } from "react";
import { Calendar, BarChart2, Clock } from "lucide-react";
import { Datepicker, TabItem, Tabs } from "flowbite-react";

import DailySalesTable from "../components/DailySalesTable";
import MonthlySalesTable from "../components/MonthlySalesTable";
import YearlySalesTable from "../components/YearlySalesTable";
import DailyCategoryTable from "../components/DailyCategoryTable";
import MonthlyCategoryTable from "../components/MonthlyCategoryTable";
import YearlyCategoryTable from "../components/YearlyCategoryTable";

export default function Statistics() {
  // 상태: 시간 모드 + 조회 기준 모드
  const [timeMode, setTimeMode] = useState("daily"); // "daily", "monthly", "yearly"
  const [filterMode, setFilterMode] = useState("date"); // "date", "category"

  // 날짜 데이터 포맷
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDateString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // 모드 변경 함수
  const handleTimeModeChange = (newTimeMode) => {
    setTimeMode(newTimeMode);
  };

  // 필터 변경 함수
  const handleFilterModeChange = (newFilterMode) => {
    setFilterMode(newFilterMode);
  };

  // 타임모드에 따른 날짜 표시 형식
  const getFormattedDateDisplay = () => {
    if (!selectedDate) return "";

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    if (timeMode === "daily") {
      return `${year}년 ${month}월 ${day}일`;
    } else if (timeMode === "monthly") {
      return `${year}년 ${month}월`;
    } else {
      return `${year}년`;
    }
  };

  // 타임모드에 따른 날짜 값 추출
  const getDateValue = () => {
    if (!selectedDate) return "";

    if (timeMode === "daily") {
      return formattedDateString;
    } else if (timeMode === "monthly") {
      return formattedDateString.substring(0, 7);
    } else {
      return formattedDateString.substring(0, 4);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 페이지 제목 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
            {filterMode === "date" ? "날짜별" : "카테고리별"} 매출 통계
          </h1>
        </div>

        {/* 필터, 모드 선택 및 날짜 선택 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 필터 모드 선택 */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">
                조회 기준
              </h2>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    filterMode === "date"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleFilterModeChange("date")}
                >
                  날짜별
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    filterMode === "category"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleFilterModeChange("category")}
                >
                  카테고리별
                </button>
              </div>
            </div>

            {/* 시간 모드 선택 */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">
                시간 단위
              </h2>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    timeMode === "daily"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTimeModeChange("daily")}
                >
                  시간별
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    timeMode === "monthly"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTimeModeChange("monthly")}
                >
                  일간
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    timeMode === "yearly"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTimeModeChange("yearly")}
                >
                  월간
                </button>
              </div>
            </div>

            {/* 날짜 선택 */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">
                날짜 선택
              </h2>
              <Datepicker
                language="en"
                labelTodayButton="오늘"
                labelClearButton="초기화"
                title={`선택된 날짜: ${getFormattedDateDisplay()}`}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e)}
                className="pb-6"
              />
            </div>
          </div>

          {/* 데이터 테이블 영역 */}

          <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            {getFormattedDateDisplay()}의{" "}
            {filterMode === "date" ? "시간대별" : "카테고리별"} 판매 데이터
          </h2>

          <div className="rounded-lg p-4">
            {/* 시간 모드의 매출 테이블 렌더링 */}
            {filterMode === "date" && timeMode === "daily" && (
              <DailySalesTable date={getDateValue()} />
            )}
            {filterMode === "date" && timeMode === "monthly" && (
              <MonthlySalesTable month={getDateValue()} />
            )}
            {filterMode === "date" && timeMode === "yearly" && (
              <YearlySalesTable year={getDateValue()} />
            )}

            {/* 카테고리 모드의 매출 데이터 렌더링 */}
            {filterMode === "category" && timeMode === "daily" && (
              <DailyCategoryTable date={getDateValue()} />
            )}
            {filterMode === "category" && timeMode === "monthly" && (
              <MonthlyCategoryTable month={getDateValue()} />
            )}
            {filterMode === "category" && timeMode === "yearly" && (
              <YearlyCategoryTable year={getDateValue()} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
