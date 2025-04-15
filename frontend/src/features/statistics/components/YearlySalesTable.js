"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSortBy, useTable } from "react-table"
import { fetchGetMonthlySales } from "../api/HttpStatService"
import { Spinner } from "flowbite-react"
import { TrendingUp, Award, Calendar, ArrowUp, ArrowDown } from "lucide-react"

export default function YearlySalesTable({ year }) {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    topMonth: null,
    totalSales: 0,
    totalTransactions: 0,
    trends: null,
  })

  // API를 호출하고 판매 데이터를 가져옴
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 해당하는 날짜의 데이터 가져오기
      const response = await fetchGetMonthlySales(year)
      setSalesData(response.data)

      // 데이터 분석 및 요약 정보 생성
      if (response.data && response.data.length > 0) {
        // 총 판매액과 판매횟수 계산
        const totalSales = response.data.reduce((sum, item) => sum + item.monthlyPrice, 0)
        const totalTransactions = response.data.reduce((sum, item) => sum + item.monthlyAmount, 0)

        // 최고 판매 월 찾기
        const topMonth = [...response.data].sort((a, b) => b.monthlyPrice - a.monthlyPrice)[0]

        // 월별 추세 분석 (성장률)
        const sortedByMonth = [...response.data].sort((a, b) => {
          const monthA = Number.parseInt(a.salesMonth.split("-")[1])
          const monthB = Number.parseInt(b.salesMonth.split("-")[1])
          return monthA - monthB
        })

        const trends = []
        for (let i = 1; i < sortedByMonth.length; i++) {
          const prevMonth = sortedByMonth[i - 1]
          const currMonth = sortedByMonth[i]

          const growthRate =
            prevMonth.monthlyPrice > 0
              ? ((currMonth.monthlyPrice - prevMonth.monthlyPrice) / prevMonth.monthlyPrice) * 100
              : 0

          trends.push({
            month: currMonth.salesMonth,
            growthRate: growthRate,
          })
        }

        setSummary({
          topMonth,
          totalSales,
          totalTransactions,
          trends,
        })
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error)
      setError(error)
    } finally {
      // 로딩 종료
      setLoading(false)
    }
  }, [year]) // date가 변경될 때마다 함수 재생성

  // 컴포넌트가 마운트되거나 year가 변경될 때 판매 데이터 호출
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

  // 월 이름 변환
  const getMonthName = (monthStr) => {
    const month = Number.parseInt(monthStr.split("-")[1])
    return `${month}월`
  }

  // 성장률 찾기
  const findGrowthRate = (monthStr) => {
    if (!summary.trends) return null
    const trend = summary.trends.find((t) => t.month === monthStr)
    return trend ? trend.growthRate : null
  }

  // react table 렌더링
  const columns = useMemo(
    () => [
      {
        Header: "판매월",
        accessor: "salesMonth",
        Cell: ({ value, row }) => {
          const isTopMonth = summary.topMonth && summary.topMonth.salesMonth === value
          const growthRate = findGrowthRate(value)

          return (
            <div className="flex items-center justify-center">
              <span className={`${isTopMonth ? "font-semibold text-indigo-600" : ""}`}>{getMonthName(value)}</span>
              {isTopMonth && (
                <span className="ml-1 text-indigo-600">
                  <Award size={16} />
                </span>
              )}
              {growthRate !== null && (
                <span
                  className={`ml-2 text-xs ${growthRate > 0 ? "text-green-600" : growthRate < 0 ? "text-red-600" : "text-gray-500"}`}
                >
                  {growthRate > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp size={12} />
                      {growthRate.toFixed(1)}%
                    </span>
                  ) : growthRate < 0 ? (
                    <span className="flex items-center">
                      <ArrowDown size={12} />
                      {Math.abs(growthRate).toFixed(1)}%
                    </span>
                  ) : (
                    "0%"
                  )}
                </span>
              )}
            </div>
          )
        },
      },
      {
        Header: "판매횟수",
        accessor: "monthlyAmount",
        Cell: ({ value, row }) => {
          const isTopMonth = summary.topMonth && summary.topMonth.salesMonth === row.original.salesMonth
          return (
            <div className={`text-center ${isTopMonth ? "text-indigo-600 font-semibold" : ""}`}>
              {formatAmount(value)}
            </div>
          )
        },
      },
      {
        Header: "총판매액",
        accessor: "monthlyPrice",
        Cell: ({ value, row }) => {
          const isTopMonth = summary.topMonth && summary.topMonth.salesMonth === row.original.salesMonth
          return (
            <div className={`text-right ${isTopMonth ? "text-indigo-600 font-semibold" : ""}`}>
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

  // 열 인덱스에 따라 정렬 클래스 반환하는 함수
  const getAlignmentClass = (index) => {
    if (index === 0 || index === 1) {
      return "text-center" // 1열, 2열은 중앙 정렬
    } else {
      return "text-right" // 3열은 오른쪽 정렬
    }
  }

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

  // 분기별 매출 계산
  const calculateQuarterlySales = () => {
    const quarters = {
      Q1: { months: ["01", "02", "03"], total: 0 },
      Q2: { months: ["04", "05", "06"], total: 0 },
      Q3: { months: ["07", "08", "09"], total: 0 },
      Q4: { months: ["10", "11", "12"], total: 0 },
    }

    salesData.forEach((item) => {
      const month = item.salesMonth.split("-")[1]

      if (quarters.Q1.months.includes(month)) {
        quarters.Q1.total += item.monthlyPrice
      } else if (quarters.Q2.months.includes(month)) {
        quarters.Q2.total += item.monthlyPrice
      } else if (quarters.Q3.months.includes(month)) {
        quarters.Q3.total += item.monthlyPrice
      } else if (quarters.Q4.months.includes(month)) {
        quarters.Q4.total += item.monthlyPrice
      }
    })

    return quarters
  }

  const quarters = calculateQuarterlySales()

  // 최고 분기 찾기
  const findBestQuarter = () => {
    let best = "Q1"
    let maxSales = quarters.Q1.total

    Object.keys(quarters).forEach((q) => {
      if (quarters[q].total > maxSales) {
        best = q
        maxSales = quarters[q].total
      }
    })

    return { quarter: best, sales: maxSales }
  }

  const bestQuarter = findBestQuarter()

  return (
    <div>
      {/* 요약 정보 카드 */}
      {summary.topMonth && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar size={16} className="mr-1" />
              <span className="text-xs font-medium">최고 매출 월</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-indigo-600">{getMonthName(summary.topMonth.salesMonth)}</span>
            </div>
            <div className="text-sm text-gray-700">{formatCurrency(summary.topMonth.monthlyPrice)}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-xs font-medium">총 판매액</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatCurrency(summary.totalSales)}</div>
            <div className="text-sm text-gray-600">월평균: {formatCurrency(summary.totalSales / salesData.length)}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <Award size={16} className="mr-1" />
              <span className="text-xs font-medium">최고 매출 분기</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{bestQuarter.quarter}</div>
            <div className="text-sm text-gray-600">{formatCurrency(bestQuarter.sales)}</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <table {...getTableProps()} className="w-full table-fixed border-collapse text-sm">
              <thead className="sticky top-0 z-10">
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
                          className={`px-6 py-2 whitespace-nowrap text-sm text-gray-700 ${getAlignmentClass(cellIdx)}`}
                          style={{ width: cellIdx === 0 ? "30%" : "35%" }}
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
