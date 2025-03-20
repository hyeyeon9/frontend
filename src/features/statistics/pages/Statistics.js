import { useEffect, useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import { useLocation, useNavigate } from "react-router-dom";
import DailySalesTable from "../components/DailySalesTable";
import MonthlySalesTable from "../components/MonthlySalesTable";
import YearlySalesTable from "../components/YearlySalesTable";

export default function Statistics() {
  const [viewMode, setViewMode] = useState("daily"); // "daily", "monthly", "yearly"
  const navigate = useNavigate();
  const { search } = useLocation();
  const calendarRef = useRef(null);

  // 날짜 데이터 포맷
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDateString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // 조회 모드를 변경: 일간/월간/연간
  useEffect(() => {
    const params = new URLSearchParams(search);
    const mode = params.get("mode") || "daily";
    setViewMode(mode);
  }, [search]);

  const handleModeChange = (mode) => {
    navigate(`/statistics?mode=${mode}`);
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

  // 최초 렌더링 시 쿼리 스트링과 상태 설정
  useEffect(() => {
    const params = new URLSearchParams(search);
    const dateFromQuery = params.get("date");
    const date = dateFromQuery ? new Date(dateFromQuery) : new Date();

    setSelectedDate(date);

    if (!dateFromQuery) {
      // 초기 렌더링 시에만 쿼리 스트링 업데이트
      const query = new URLSearchParams(window.location.search);
      query.set("date", formattedDateString);
      navigate(`/statistics?${query.toString()}`);
    }
  }, []);

  // selectedDate 변경 시 쿼리 스트링 업데이트
  useEffect(() => {
    const params = new URLSearchParams(search);
    const dateFromQuery = params.get("date");
    if (dateFromQuery !== formattedDateString) {
      const query = new URLSearchParams(window.location.search);
      query.set("date", formattedDateString);
      navigate(`/statistics?${query.toString()}`);
    }

    console.log("selectedDate changed:", selectedDate, " / ", search);
  }, [selectedDate, navigate, search]);

  return (
    <div className="flex flex-col gap-4">
      <h2>{viewMode.toUpperCase()} 매출</h2>
      <button onClick={() => handleModeChange("daily")}>일간</button>
      <button onClick={() => handleModeChange("monthly")}>월간</button>
      <button onClick={() => handleModeChange("yearly")}>연간</button>
      <Calendar
        ref={calendarRef}
        onChange={handleDateChange}
        value={selectedDate}
      />

      {/* 매출 데이터 렌더링 */}
      {viewMode === "daily" && formattedDateString && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString}일의 판매 데이터
          </p>
          <DailySalesTable date={formattedDateString} />
        </div>
      )}
      {viewMode === "monthly" && formattedDateString && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString.substring(0, 7)}월의 판매 데이터
            <MonthlySalesTable month={formattedDateString.substring(0, 7)} />
          </p>
        </div>
      )}
      {viewMode === "yearly" && formattedDateString && (
        <div>
          <p className="text-xl text-center">
            {formattedDateString.substring(0, 4)}년의 판매 데이터
          </p>
          <YearlySalesTable year={formattedDateString.substring(0, 4)} />
        </div>
      )}
    </div>
  );
}
