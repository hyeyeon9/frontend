"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSortBy, useTable } from "react-table"
import { fetchGetYearlyCategory, fetchGetYearlySubCategory } from "../api/HttpStatService"
import { Spinner } from "flowbite-react"
import SubCategoryModal from "./SubCategoryModal"
import categoryMapping from "../../../components/categoryMapping" // 대분류 매핑 데이터
import { Award, TrendingUp, PieChart } from "lucide-react"

const MainCategory = categoryMapping

export default function YearlyCategoryTable({ year }) {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    topCategory: null,
    totalSales: 0,
    totalTransactions: 0,
  })

  // 소분류 데이터와 모달의 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subCategoryData, setSubCategoryData] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  // API를 호출하고 판매 데이터를 가져옴
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 해당하는 날짜의 데이터 가져오기
      const response = await fetchGetYearlyCategory(year)
      setSalesData(response.data)

      // 데이터 분석 및 요약 정보 생성
      if (response.data && response.data.length > 0) {
        // 총 판매액과 판매횟수 계산
        const totalSales = response.data.reduce((sum, item) => sum + item.yearlyPrice, 0)
        const totalTransactions = response.data.reduce((sum, item) => sum + item.yearlyAmount, 0)

        // 최고 판매 카테고리 찾기
        const topCategory = [...response.data].sort((a, b) => b.yearlyPrice - a.yearlyPrice)[0]

        setSummary({
          topCategory,
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
  }, [year]) // date가 변경될 때마다 함수 재생성

  // 대분류 클릭 시 소분류 데이터 호출
  const fetchSubCategoryData = async (categoryId) => {
    try {
      const response = await fetchGetYearlySubCategory(year, categoryId)
      setSubCategoryData(response.data)
    } catch (error) {
      console.error("소분류 데이터를 불러오는 중 오류가 발생했습니다.", error)
    }
  }

  // 대분류 클릭 시 소분류 모달 열기
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    fetchSubCategoryData(categoryId)
    setIsModalOpen(true)
  }

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

  // categoryId -> categoryName 매핑
  const getCategoryName = (categoryId) => {
    const category = MainCategory.find((c) => c.id === categoryId)
    return category ? category.sub : "알 수 없음"
  }

  // 최대값 대비 퍼센트 계산 (히트맵 색상용)
  const getPercentageOfMax = (value, key) => {
    if (!salesData || salesData.length === 0) return 0
    const max = Math.max(...salesData.map((item) => item[key]))
    return max > 0 ? (value / max) * 100 : 0
  }

  // 총 매출 대비 비율 계산
  const getPercentOfTotal = (value) => {
    return summary.totalSales > 0 ? ((value / summary.totalSales) * 100).toFixed(1) + "%" : "0%"
  }

  // react table 렌더링
  const columns = useMemo(
    () => [
      {
        Header: "대분류",
        accessor: "categoryId",
        Cell: ({ value, row }) => {
          const isTopCategory = summary.topCategory && summary.topCategory.categoryId === value
          return (
            <div className="flex items-center justify-center">
              <span className={`${isTopCategory ? "font-semibold text-indigo-600" : ""}`}>
                {getCategoryName(value)}
              </span>
              {isTopCategory && (
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
        accessor: "yearlyAmount",
        Cell: ({ value, row }) => {
          const isTopCategory = summary.topCategory && summary.topCategory.categoryId === row.original.categoryId
          return (
            <div className={`text-center ${isTopCategory ? "text-indigo-600 font-semibold" : ""}`}>
              {formatAmount(value)}
            </div>
          )
        },
      },
      {
        Header: "총판매액",
        accessor: "yearlyPrice",
        Cell: ({ value, row }) => {
          const isTopCategory = summary.topCategory && summary.topCategory.categoryId === row.original.categoryId
          const percentOfTotal = getPercentOfTotal(value)
          return (
            <div className={`text-right relative`}>
              <div className="flex justify-end items-center">
                <span className={`${isTopCategory ? "text-indigo-600 font-semibold" : ""}`}>
                  {formatCurrency(value)}
                </span>
                <span className="ml-2 text-xs text-gray-500">({percentOfTotal})</span>
              </div>
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

  // 카테고리 분포 계산
  const calculateCategoryDistribution = () => {
    const totalSales = summary.totalSales
    if (totalSales === 0) return []

    // 상위 3개 카테고리 추출
    const top3Categories = [...salesData].sort((a, b) => b.yearlyPrice - a.yearlyPrice).slice(0, 3)

    return top3Categories.map((cat) => ({
      name: getCategoryName(cat.categoryId),
      percentage: ((cat.yearlyPrice / totalSales) * 100).toFixed(1),
    }))
  }

  const categoryDistribution = calculateCategoryDistribution()

  return (
    <div>
      {/* 요약 정보 카드 */}
      {summary.topCategory && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <PieChart size={16} className="mr-1" />
              <span className="text-xs font-medium">최고 매출 카테고리</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-indigo-600">
                {getCategoryName(summary.topCategory.categoryId)}
              </span>
            </div>
            <div className="text-sm text-gray-700">{formatCurrency(summary.topCategory.yearlyPrice)}</div>
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
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                      onClick={() => handleCategoryClick(row.original.categoryId)}
                    >
                      {row.cells.map((cell, cellIdx) => (
                        <td
                          {...cell.getCellProps()}
                          key={cellIdx}
                          className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 ${getAlignmentClass(cellIdx)}`}
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

      {/* 매출 인사이트 */}
      {summary.topCategory && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-1">📊 카테고리 인사이트</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">{getCategoryName(summary.topCategory.categoryId)}</span> 카테고리가 올해
              최고 매출을 기록했습니다. (총 {formatCurrency(summary.topCategory.yearlyPrice)}, 전체 매출의{" "}
              {getPercentOfTotal(summary.topCategory.yearlyPrice)})
            </li>

            {categoryDistribution.length > 0 && (
              <li>
                상위 3개 카테고리 비중:{" "}
                {categoryDistribution.map((cat, idx) => (
                  <span key={idx} className="font-medium">
                    {cat.name} ({cat.percentage}%){idx < categoryDistribution.length - 1 ? ", " : ""}
                  </span>
                ))}
              </li>
            )}

            <li>카테고리를 클릭하면 소분류별 상세 매출을 확인할 수 있습니다.</li>
          </ul>
        </div>
      )}

      {/* 소분류 모달 컴포넌트 */}
      <SubCategoryModal
        isOpen={isModalOpen}
        subCategoryData={subCategoryData}
        dataKeys={{ amountKey: "yearlyAmount", priceKey: "yearlyPrice" }}
        closeModal={() => setIsModalOpen(false)}
      />
    </div>
  )
}
