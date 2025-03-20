import { useCallback, useEffect, useMemo, useState } from "react";
import { useSortBy, useTable } from "react-table";
import { fetchGetHourlySales } from "../api/HttpStatisticsService";

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

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  if (error) {
    // 에러 메세지 표시
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="w-[800px] max-h-[calc(100vh-300px)] overflow-auto">
      <table
        {...getTableProps()}
        border="1"
        className="w-full border-collapse border border-gray-300 mt-3"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((c) => (
                // 정렬
                <th
                  {...c.getHeaderProps(c.getSortByToggleProps())}
                  className="px-4 py-2 bg-gray-200"
                >
                  {/* 동적 렌더링 */}
                  {c.render("Header")}
                  <span>
                    {c.isSorted ? (c.isSortedDesc ? " 🔽" : " 🔼") : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-100">
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="px-2 py-3 border">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
