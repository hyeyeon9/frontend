import { useEffect, useState } from "react";
import { fetchTodaySales } from "../api/httpStatisticsService";
import DiffChart from "../components/DiffChart";


export default function SalesToday() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTodaySales();
        setSalesData(response.data);
        setLoading(false);
      } catch (error) {
        // 에러처리
        console.error(
          "시간별 데이터를 가져오는 데 오류가 발생했습니다: ",
          error
        );
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>{error}</div>;
  }

  // salesData가 빈 배열인 경우
  if (salesData.length === 0) {
    return <div>데이터가 없습니다.</div>;
  }

  return (
    <div>
      <DiffChart data={salesData} />
    </div>
  );
}
