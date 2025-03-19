import { useEffect, useState } from "react";
import { fetchGetDaily } from "../api/httpStatisticsService";

export default function DailySalesTable({ date }) {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터를 받아서 상태에 저장
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);

        // 해당하는 날짜의 데이터 가져오기
        const response = await fetchGetDaily(date);
        setSalesData(response.data);

        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
        setLoading(false);
      }
    };

    fetchSalesData();
    console.log(salesData);
  }, [date]);

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  return <></>;
}
