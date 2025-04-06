import { useMemo } from "react";
import { useSortBy, useTable } from "react-table";
import subCategoryMapping from "../../../components/subCategoryMapping";

const SubCategory = subCategoryMapping;

export default function SubCategoryModal({
  isOpen,
  subCategoryData,
  closeModal,
  dataKeys = { amountKey: "monthlyAmount", priceKey: "monthlyPrice" },
}) {
  // 데이터 포맷팅을 위한 셀 렌더러
  const formatCurrency = (value) => {
    return value.toLocaleString() + "원";
  };

  const formatAmount = (value) => {
    return value.toLocaleString();
  };

  // 소분류의 categoryId -> name 매핑
  const getSubCategoryName = (categoryId) => {
    const subCategory = SubCategory.find((c) => c.id === categoryId);
    return subCategory ? subCategory.name : "알 수 없음";
  };

  const columns = useMemo(
    () => [
      {
        Header: "소분류",
        accessor: "subCategoryId",
        Cell: ({ value }) => getSubCategoryName(value),
      },
      {
        Header: "판매횟수",
        accessor: dataKeys.amountKey,
        Cell: ({ value }) => formatAmount(value),
      },
      {
        Header: "총판매액",
        accessor: dataKeys.priceKey,
        Cell: ({ value }) => formatCurrency(value),
      },
    ],
    [dataKeys]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: subCategoryData }, useSortBy);

  // 열 인덱스에 따라 정렬 클래스 반환하는 함수
  const getAlignmentClass = (index) => {
    if (index === 0 || index === 1) {
      return "text-center"; // 1열, 2열은 중앙 정렬
    } else {
      return "text-right"; // 3열은 오른쪽 정렬
    }
  };

  // open 상태가 아닌 경우
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white p-6 rounded-lg w-4/5 max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">소분류 판매 데이터</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={closeModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table
            {...getTableProps()}
            className="w-full table-fixed border-collapse text-sm"
          >
            <thead>
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
