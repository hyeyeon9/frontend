import { useCallback, useEffect, useMemo, useState } from "react";
import { useSortBy, useTable } from "react-table";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { fetchGetHourlySales } from "../api/HttpStatService";

export default function DailySalesTable({ date }) {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "salesHour",
    direction: "asc",
  });

  // API를 호출하고 판매 데이터를 가져옴
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 해당하는 날짜의 데이터 가져오기
      const response = await fetchGetHourlySales(date);
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
  }, [fetchSalesData]);

  // react table 렌더링
  const columns = useMemo(
    () => [
      { Header: "판매시간", accessor: "salesHour" },
      { Header: "판매횟수", accessor: "dailyAmount" },
      { Header: "총판매액", accessor: "dailyPrice" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: salesData }, useSortBy);

  // 정렬 처리
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    if (!salesData) return [];

    const sortableData = [...salesData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [salesData, sortConfig]);

  // 총계 계산
  const totals = useMemo(() => {
    if (!salesData || salesData.length === 0) return { amount: 0, price: 0 };

    return salesData.reduce(
      (acc, item) => {
        return {
          amount: acc.amount + (item.dailyAmount || 0),
          price: acc.price + (item.dailyPrice || 0),
        };
      },
      { amount: 0, price: 0 }
    );
  }, [salesData]);

  if (loading) {
    // 로딩 중 표시
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    // 에러 메세지 표시
    return (
      <div className="p-4 text-center text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer border-b"
              onClick={() => requestSort("salesHour")}
            >
              <div className="flex items-center gap-1">
                <span>판매시간</span>
                {sortConfig.key === "salesHour" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer border-b"
              onClick={() => requestSort("dailyAmount")}
            >
              <div className="flex items-center gap-1">
                <span>판매횟수</span>
                {sortConfig.key === "dailyAmount" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer border-b"
              onClick={() => requestSort("dailyPrice")}
            >
              <div className="flex items-center gap-1">
                <span>총판매액</span>
                {sortConfig.key === "dailyPrice" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {row.salesHour}시
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {row.dailyAmount || 0}회
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {(row.dailyPrice || 0).toLocaleString()}원
              </td>
            </tr>
          ))}
          {/* 총계 행 */}
          <tr className="bg-gray-50 font-medium">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              총계
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {totals.amount.toLocaleString()}회
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {totals.price.toLocaleString()}원
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
