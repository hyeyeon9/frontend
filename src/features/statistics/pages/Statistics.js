import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { useLocation, useNavigate } from "react-router-dom";
import DailySalesTable from "../components/DailySalesTable";

export default function Statistics() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState("daily"); // "daily", "monthly", "yearly"
  const navigate = useNavigate();
  const { search } = useLocation();

  // 조회 모드를 변경: 일간/월간/연간
  useEffect(() => {
    const params = new URLSearchParams(search);
    const mode = params.get("mode") || "daily";
    setViewMode(mode);
  }, [search]);

  const handleModeChange = (mode) => {
    navigate(`/statistics?mode=${mode}`);
  };

  // 최초 렌더링 시 오늘 날짜를 설정

  // // 캘린더에서 날짜를 선택했을 때 쿼리 스트링을 업데이트
  // useEffect(() => {
  //   // 초기값
  //   const params = new URLSearchParams(search);
  //   const dateFromQuery = params.get("date");

  //   // 쿼리스트링이 비어 있으면 오늘 날짜로 설정
  //   const date = dateFromQuery ? new Date(dateFromQuery) : new Date();

  //   setSelectedDate(date);
  //   setFormattedDate(date.toISOString().split("T")[0]);

  //   // 쿼리스트링 업데이트
  //   const query = new URLSearchParams(window.location.search);
  //   query.set("date", formattedDate);
  //   navigate(`/statistics?${query.toString()}`);
  // }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2>{viewMode.toUpperCase()} 매출</h2>
      <button onClick={() => handleModeChange("daily")}>일간</button>
      <button onClick={() => handleModeChange("monthly")}>월간</button>
      <button onClick={() => handleModeChange("yearly")}>연간</button>
      <Calendar onChange={setSelectedDate} value={selectedDate} />

      <p className="text-xl text-center">판매 데이터 들어갈 곳</p>

      {/* 매출 데이터 렌더링 */}
      {viewMode === "daily" && (
        <div>
          <p className="text-xl text-center">{formattedDate}일의 판매 데이터</p>
          <DailySalesTable date={formattedDate} />
        </div>
      )}
      {viewMode === "monthly" && (
        <div>
          <p className="text-xl text-center">월간 판매 데이터</p>
        </div>
      )}
      {viewMode === "yearly" && (
        <div>
          <p className="text-xl text-center">연간 판매 데이터</p>
        </div>
      )}
    </div>
  );
}
