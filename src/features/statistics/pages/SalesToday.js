import { useEffect, useState } from "react";
import { fetchGetSales, fetchTodaySales } from "../api/httpStatisticsService";
import DiffChart from "../components/DiffChart";

const today = new Date().toISOString().split("T")[0];

// 어제 날짜
const yesterdayStr = new Date(new Date(today) - 86400000)
  .toISOString()
  .split("T")[0];

export default function SalesToday() {
  const [todayData, setTodayData] = useState([]);
  const [yesterdayData, setYesterdayData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터를 받아서 상태에 저장
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);

        // 오늘 날짜의 데이터
        const todayResponse = await fetchGetSales(today);
        setTodayData(todayResponse.data);

        // 어제 날짜의 데이터
        const yesResponse = await fetchGetSales(yesterdayStr);
        setYesterdayData(yesResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <DiffChart todayData={todayData} yesterdayData={yesterdayData} />
      </div>
    </div>
  );
}
