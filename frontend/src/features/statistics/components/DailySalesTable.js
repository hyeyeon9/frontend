"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSortBy, useTable } from "react-table"
import { fetchGetHourlySales } from "../api/HttpStatService"
import { Spinner } from "flowbite-react"
import { TrendingUp, Award, Clock } from "lucide-react"

export default function DailySalesTable({ date }) {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    topHour: null,
    totalSales: 0,
    totalTransactions: 0,
  })

  // API를 호출하고 판매 데이터를 가져옴
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 해당하는 날짜의 데이터 가져오기
      const response = await fetchGetHourlySales(date)
      setSalesData(response.data)

      // 데이터 분석 및 요약 정보 생성
      if (response.data && response.data.length > 0) {
        // 총 판매액과 판매횟수 계산
        const totalSales = response.data.reduce((sum, item) => sum + item.dailyPrice, 0)
        const totalTransactions = response.data.reduce((sum, item) => sum + item.dailyAmount, 0)

        // 최고 판매 시간대 찾기
        const topHour = [...response.data].sort((a, b) => b.dailyPrice - a.dailyPrice)[0]

        setSummary({
          topHour,
          totalSales,
          totalTransactions,
        })
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error)
      setError(error)
    } finally {
      // 로딩 종료
      setLoading(false)
    }
  }, [date]) // date가 변경될 때마다 함수 재생성

  // 컴포넌트가 마운트되거나 date가 변경될 때 판매 데이터 호출
  useEffect(() => {
    fetchSalesData()
  }, [fetchSalesData])

  // 데이터 포맷팅을 위한 셀 렌더러
  const formatCurrency = (value) => {
    return value.toLocaleString() + "원"
  }

  const formatAmount = (value) => {
    return value.toLocaleString()
  }

  // react table 렌더링
  const columns = useMemo(
    () => [
      {
        Header: "판매시간",
        accessor: "salesHour",
        Cell: ({ value, row }) => {
          const isTopHour = summary.topHour && summary.topHour.salesHour === value
          return (
            <div className="flex items-center justify-center">
              <span className={`${isTopHour ? "font-semibold text-indigo-600" : ""}`}>{`${value}시`}</span>
              {isTopHour && (
                <span className="ml-1 text-indigo-600">
                  <Award size={16} />
                </span>
              )}
            </div>
          )
        },
      },
      {
        Header: "판매횟수",
        accessor: "dailyAmount",
        Cell: ({ value, row }) => {
          const isTopHour = summary.topHour && summary.topHour.salesHour === row.original.salesHour
          return (
            <div className={`text-center ${isTopHour ? "text-indigo-600 font-semibold" : ""}`}>
              {formatAmount(value)}
            </div>
          )
        },
      },
      {
        Header: "총판매액",
        accessor: "dailyPrice",
        Cell: ({ value, row }) => {
          const isTopHour = summary.topHour && summary.topHour.salesHour === row.original.salesHour
          return (
            <div className={`text-right ${isTopHour ? "text-indigo-600 font-semibold" : ""}`}>
              {formatCurrency(value)}
            </div>
          )
        },
      },
    ],
    [summary],
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: salesData },
    useSortBy,
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        오류: {error.message || "데이터를 불러오는 중 문제가 발생했습니다"}
      </div>
    )
  }

  if (salesData.length === 0) {
    return <div className="text-center text-gray-500 py-8">데이터가 없습니다</div>
  }

  // 열 인덱스에 따라 정렬 클래스 반환하는 함수
  const getAlignmentClass = (index) => {
    if (index === 0 || index === 1) {
      return "text-center" // 1열, 2열은 중앙 정렬
    } else {
      return "text-right" // 3열은 오른쪽 정렬
    }
  }

  return (
    <div>
      {/* 요약 정보 카드 */}
      {summary.topHour && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <Clock size={16} className="mr-1" />
              <span className="text-xs font-medium">최고 매출 시간대</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-indigo-600">{summary.topHour.salesHour}시</span>
              <span className="ml-2 text-gray-700">{formatCurrency(summary.topHour.dailyPrice)}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-xs font-medium">총 판매액</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatCurrency(summary.totalSales)}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <Award size={16} className="mr-1" />
              <span className="text-xs font-medium">총 판매횟수</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatAmount(summary.totalTransactions)}회</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <table {...getTableProps()} className="w-full table-fixed border-collapse text-sm">
              <thead className="sticky top-0 z-5">
                {headerGroups.map((headerGroup, idx) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={idx} className="bg-gray-50 border-b border-gray-200">
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
                  prepareRow(row)
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
                          className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 ${getAlignmentClass(cellIdx)}`}
                          style={{ width: cellIdx === 0 ? "30%" : "35%" }} // 헤더와 동일한 너비 지정
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
