import { useCallback, useEffect, useState } from "react";
import { fetchGetDaily } from "../api/httpStatisticsService";

export default function DailySalesTable({ date }) {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API를 호출하고 판매 데이터를 가져옴
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 해당하는 날짜의 데이터 가져오기
      const response = await fetchGetDaily(date);
      setSalesData(response.data);
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
      setError(error);
    } finally {
      // 로딩 종료
      setLoading(false);
    }
  }, [date]); // date가 변경될 때마다 함수 재생성

  // 컴포넌트가 마운트되거나 date가 변경될 때 판매 데이터 호출
  useEffect(() => {
    fetchSalesData();
    console.log(salesData);
  }, [fetchSalesData]);

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  if (error) {
    // 에러 메세지 표시
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="">판매시각</th>
            <th className="">총판매액</th>
            <th className="">총판매량</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {salesData.map((item) => (
            <tr>
              <td>{item.salesHour}</td>
              <td>{item.dailyPrice}</td>
              <td>{item.dailyAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
