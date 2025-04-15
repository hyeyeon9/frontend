"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useMemo } from "react"
import { useSortBy, useTable } from "react-table"
import { Award } from "lucide-react"
import subCategoryMapping from "../../../components/subCategoryMapping"

const SubCategory = subCategoryMapping

export default function SubCategoryModal({ isOpen, subCategoryData, dataKeys, closeModal }) {
  // 데이터 포맷팅을 위한 셀 렌더러
  const formatCurrency = (value) => {
    return value.toLocaleString() + "원"
  }

  const formatAmount = (value) => {
    return value.toLocaleString()
  }

  // 소분류의 categoryId -> name 매핑
  const getSubCategoryName = (categoryId) => {
    const subCategory = SubCategory.find((c) => c.id === categoryId)
    return subCategory ? subCategory.name : "알 수 없음"
  }

  // 최대값 대비 퍼센트 계산 (히트맵 색상용)
  const getPercentageOfMax = (value, key) => {
    if (!subCategoryData || subCategoryData.length === 0) return 0
    const max = Math.max(...subCategoryData.map((item) => item[key]))
    return max > 0 ? (value / max) * 100 : 0
  }

  // 최고 판매 소분류 찾기
  const topSubCategory = useMemo(() => {
    if (!subCategoryData || subCategoryData.length === 0) return null
    return [...subCategoryData].sort((a, b) => b[dataKeys.priceKey] - a[dataKeys.priceKey])[0]
  }, [subCategoryData, dataKeys.priceKey])

  // react table 렌더링
  const columns = useMemo(
    () => [
      {
        Header: "소분류",
        accessor: "subCategoryId",
        Cell: ({ value, row }) => {
          const isTopSubCategory = topSubCategory && topSubCategory.subCategoryId === value
          return (
            <div className="flex items-center justify-center">
              <span className={`${isTopSubCategory ? "font-semibold text-indigo-600" : ""}`}>
                {getSubCategoryName(value)}
              </span>
              {isTopSubCategory && (
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
        accessor: dataKeys.amountKey,
        Cell: ({ value, row }) => {
          const isTopSubCategory = topSubCategory && topSubCategory.subCategoryId === row.original.subCategoryId
          return (
            <div className={`text-center ${isTopSubCategory ? "text-indigo-600 font-semibold" : ""}`}>
              {formatAmount(value)}
            </div>
          )
        },
      },
      {
        Header: "총판매액",
        accessor: dataKeys.priceKey,
        Cell: ({ value, row }) => {
          const isTopSubCategory = topSubCategory && topSubCategory.subCategoryId === row.original.subCategoryId
          return (
            <div className={`text-right ${isTopSubCategory ? "text-indigo-600 font-semibold" : ""}`}>
              {formatCurrency(value)}
            </div>
          )
        },
      },
    ],
    [dataKeys.amountKey, dataKeys.priceKey, topSubCategory],
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: subCategoryData || [] },
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    소분류별 매출 상세
                  </Dialog.Title>
                  <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table {...getTableProps()} className="w-full table-fixed border-collapse text-sm">
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
                                  style={{ width: colIdx === 0 ? "40%" : "30%" }}
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
                                    className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 ${getAlignmentClass(
                                      cellIdx,
                                    )}`}
                                    style={{ width: cellIdx === 0 ? "40%" : "30%" }}
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

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={closeModal}
                  >
                    닫기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
