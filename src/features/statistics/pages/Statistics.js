import { useEffect, useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import { useLocation, useNavigate } from "react-router-dom";
import DailySalesTable from "../components/DailySalesTable";
import MonthlySalesTable from "../components/MonthlySalesTable";
import YearlySalesTable from "../components/YearlySalesTable";
import DailyCategoryTable from "../components/DailyCategoryTable";
import MonthlyCategoryTable from "../components/MonthlyCategoryTable";
import YearlyCategoryTable from "../components/YearlyCategoryTable";

export default function Statistics() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const calendarRef = useRef(null);

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

  // URL 파라미터에서 모드 설정
  useEffect(() => {
    const params = new URLSearchParams(search);
    setTimeMode(params.get("time") || "daily");
    setFilterMode(params.get("filter") || "date");
  });

  // 모드 변경 함수
  const handleModeChange = (newTimeMode) => {
    const query = new URLSearchParams(search);
    query.set("time", newTimeMode);
    navigate(`/statistics?${query.toString()}`);
  };

  // 필터 변경 함수
  const handleFilterChange = (newFilterMode) => {
    const query = new URLSearchParams(search);
    query.set("filter", newFilterMode);
    navigate(`/statistics?${query.toString()}`);
  };

  // 날짜를 클릭하면 selectedDate 상태를 업데이트
  const handleDateChange = (date) => {
    if (date.toISOString() !== selectedDate.toISOString()) {
      setSelectedDate(date);
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.value = selectedDate;
    }
  }, [selectedDate]);

  // URL 파라미터 동기화
  useEffect(() => {
    const query = new URLSearchParams(search);
    query.set("date", formattedDateString);
    navigate(`/statistics?${query.toString()}`);
  }, [selectedDate, navigate, search]);

  // 모드 또는 날짜가 변경되면 URL을 업데이트함
  useEffect(() => {
    if (filterMode === "date") {
      const params = new URLSearchParams(search);
      const dateFromQuery = params.get("date");

      if (dateFromQuery !== formattedDateString) {
        const query = new URLSearchParams(search);
        query.set("date", formattedDateString);
        navigate(`/statistics?${query.toString()}`);
      }
    }
  }, [selectedDate, filterMode, navigate, search]);

  return (
    <div className="flex flex-col gap-4">
      <h2>
        {filterMode === "date" ? "날짜별" : "카테고리별"}
        {timeMode.toUpperCase()} 매출
      </h2>

      {/* 모드 선택 버튼 */}
      <div className="flex flex-col gap-4">
        {/* 필터 모드 선택 */}
        <div className="flex gap-2">
          <button onClick={() => handleFilterChange("date")}>날짜별</button>
          <button onClick={() => handleFilterChange("category")}>
            카테고리별
          </button>
        </div>

        {/* 시간별 모드 선택 */}
        <div className="flex gap-2">
          <button onClick={() => handleModeChange("daily")}>일간</button>
          <button onClick={() => handleModeChange("monthly")}>월간</button>
          <button onClick={() => handleModeChange("yearly")}>연간</button>
        </div>
      </div>

      <Calendar
        ref={calendarRef}
        onChange={handleDateChange}
        value={selectedDate}
      />

      {/* 시간 모드의 매출 테이블 렌더링 */}
      {filterMode === "date" && timeMode === "daily" && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString}일의 시간대별 판매 데이터
          </p>
          <DailySalesTable date={formattedDateString} />
        </div>
      )}
      {filterMode === "date" && timeMode === "monthly" && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString.substring(0, 7)}월의 일일 판매 데이터
          </p>
          <MonthlySalesTable month={formattedDateString.substring(0, 7)} />
        </div>
      )}
      {filterMode === "date" && timeMode === "yearly" && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString.substring(0, 4)}년의 월별 판매 데이터
          </p>
          <YearlySalesTable year={formattedDateString.substring(0, 4)} />
        </div>
      )}

      {/* 카테고리 모드의 매출 데이터 렌더링 */}
      {filterMode === "category" && timeMode === "daily" && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString}일의 카테고리별 판매 데이터
          </p>
          <DailyCategoryTable date={formattedDateString} />
        </div>
      )}
      {filterMode === "category" && timeMode === "monthly" && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString.substring(0, 7)}월의 카테고리별 판매 데이터
          </p>
          <MonthlyCategoryTable month={formattedDateString.substring(0, 7)} />
        </div>
      )}
      {filterMode === "category" && timeMode === "yearly" && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString.substring(0, 4)}년의 카테고리별 판매 데이터
          </p>
          <YearlyCategoryTable year={formattedDateString.substring(0, 4)} />
        </div>
      )}
    </div>
  );
}
