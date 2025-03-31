import { useCallback, useEffect, useMemo, useState } from "react";
import { useSortBy, useTable } from "react-table";
import { fetchGetDailySales } from "../api/HttpStatService";
import { Spinner } from "flowbite-react";

export default function MonthlySalesTable({ month }) {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API를 호출하고 판매 데이터를 가져옴
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 해당하는 날짜의 데이터 가져오기
      const response = await fetchGetDailySales(month);
      setSalesData(response.data);
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
      setError(error);
    } finally {
      // 로딩 종료
      setLoading(false);
    }
  }, [month]); // date가 변경될 때마다 함수 재생성

  // 컴포넌트가 마운트되거나 month가 변경될 때 판매 데이터 호출
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // 데이터 포맷팅을 위한 셀 렌더러
  const formatCurrency = (value) => {
    return value.toLocaleString() + "원";
  };

  const formatAmount = (value) => {
    return value.toLocaleString();
  };

  // react table 렌더링
  const columns = useMemo(
    () => [
      {
        Header: "판매일자",
        accessor: "salesDate",
      },
      {
        Header: "판매횟수",
        accessor: "dailyAmount",
        Cell: ({ value }) => formatAmount(value),
      },
      {
        Header: "총판매액",
        accessor: "dailyPrice",
        Cell: ({ value }) => formatCurrency(value),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: salesData }, useSortBy);

  // 열 인덱스에 따라 정렬 클래스 반환하는 함수
  const getAlignmentClass = (index) => {
    if (index === 0 || index === 1) {
      return "text-center"; // 1열, 2열은 중앙 정렬
    } else {
      return "text-right"; // 3열은 오른쪽 정렬
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        오류: {error.message || "데이터를 불러오는 중 문제가 발생했습니다"}
      </div>
    );
  }

  if (salesData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">데이터가 없습니다</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <table
            {...getTableProps()}
            className="w-full table-fixed border-collapse text-sm"
          >
            <thead className="sticky top-0 z-10">
              {headerGroups.map((headerGroup, idx) => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  key={idx}
                  className="bg-gray-50 border-b border-gray-200"
                >
                  {headerGroup.headers.map((column, colIdx) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={colIdx}
                      className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      style={{ width: colIdx === 0 ? "30%" : "35%" }}
                    >
                      <div className="flex items-center justify-center">
                        {column.render("Header")}
                        <span className="ml-1">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            )
                          ) : (
                            ""
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y">
              {rows.map((row, idx) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={idx}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {row.cells.map((cell, cellIdx) => (
                      <td
                        {...cell.getCellProps()}
                        key={cellIdx}
                        className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 ${getAlignmentClass(
                          cellIdx
                        )}`}
                        style={{ width: cellIdx === 0 ? "30%" : "35%" }}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
