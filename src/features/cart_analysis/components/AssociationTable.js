"use client"

import { useMemo } from "react"
import { useSortBy, useTable } from "react-table"
import { ArrowDown, ArrowUp, Search } from "lucide-react"

function AssociationTable({ data, filteringText }) {
  const columns = useMemo(
    () => [
      {
        Header: "상품 A",
        accessor: "itemset_a",
        Cell: ({ value }) => <div className="font-medium text-gray-800">{value}</div>,
      },
      {
        Header: "상품 B",
        accessor: "itemset_b",
        Cell: ({ value }) => <div className="font-medium text-gray-800">{value}</div>,
      },
      {
        Header: "지지도(support)",
        accessor: "support",
        Cell: ({ value }) => (
          <div className="text-center">
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
              {(value * 100).toFixed(1)}%
            </span>
          </div>
        ),
      },
      {
        Header: "신뢰도(confidence)",
        accessor: "confidence",
        Cell: ({ value }) => (
          <div className="text-center">
            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded-md">
              {(value * 100).toFixed(1)}%
            </span>
          </div>
        ),
      },
      {
        Header: "향상도(lift)",
        accessor: "lift",
        Cell: ({ value }) => (
          <div className="text-center">
            <span
              className={`inline-block px-2 py-1 rounded-md ${
                value > 1.5 ? "bg-purple-50 text-purple-700" : "bg-gray-50 text-gray-700"
              }`}
            >
              {value.toFixed(2)}
            </span>
          </div>
        ),
      },
    ],
    [],
  )

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!filteringText) return data // 검색어 없으면 전체 데이터 반환
    return data.filter(
      (row) =>
        row.itemset_a.toLowerCase().includes(filteringText.toLowerCase()) ||
        row.itemset_b.toLowerCase().includes(filteringText.toLowerCase()),
    )
  }, [data, filteringText])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: filteredData },
    useSortBy,
  )

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <Search className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
          <p className="text-gray-500">다른 검색어로 시도해보세요.</p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-300px)] overflow-auto">
          <table {...getTableProps()} className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {headerGroups.map((headerGroup, idx) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                  {headerGroup.headers.map((column, colIdx) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      key={colIdx}
                    >
                      <div className="flex items-center">
                        {column.render("Header")}
                        <span className="ml-1">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <ArrowDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ArrowUp className="h-4 w-4 text-gray-400" />
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

            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIdx) => {
                prepareRow(row)
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors" key={rowIdx}>
                    {row.cells.map((cell, cellIdx) => (
                      <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap" key={cellIdx}>
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AssociationTable

