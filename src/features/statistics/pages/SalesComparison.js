import { useEffect, useState } from "react";
import { fetchGetHourlySales } from "../api/HttpStatService";
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

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      {/* Date Picker Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Datepicker
          inline
          language="ko-KR"
          labelTodayButton="오늘"
          labelClearButton="초기화"
          title={`기준 날짜: ${formattedDate1}`}
          label="date1"
          format="yyyy-mm-dd"
          value={date1}
          onChange={(e) => setDate1(e)}
        />
        <Datepicker
          inline
          language="ko-KR"
          labelTodayButton="오늘"
          labelClearButton="초기화"
          title={`비교할 날짜: ${formattedDate2}`}
          label="date2"
          value={date2}
          onChange={(e) => setDate2(e)}
        />
      </div>
      {/* Chart Section */}
      <div className="mb-4">
        <DiffChart
          todayData={salesData1}
          targetDateData={salesData2}
          date1={formattedDate1}
          date2={formattedDate2}
        />
      </div>
      {/* Table Sections */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid">
          <DailySalesTable date={formattedDate1} />
        </div>
        <div className="grid">
          <DailySalesTable date={formattedDate2} />
        </div>
      </div>
    </div>
  );
}
