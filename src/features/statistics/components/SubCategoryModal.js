import { useMemo } from "react";
import { useSortBy, useTable } from "react-table";

export default function SubCategoryModal({
  isOpen,
  subCategoryData,
  closeModal,
  dataKeys = { amountKey: "monthlyAmount", priceKey: "monthlyPrice" },
}) {
  const columns = useMemo(
    () => [
      { Header: "소분류", accessor: "subCategoryId" },
      { Header: "판매횟수", accessor: dataKeys.amountKey },
      { Header: "총판매액", accessor: dataKeys.priceKey },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: subCategoryData }, useSortBy);

  // open 상태가 아닌 경우
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white p-6 rounded-lg w-4/5 max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          닫기
        </button>
        <h3 className="text-xl font-semibold mb-4">소분류 판매 데이터</h3>
        <table
          {...getTableProps()}
          className="w-full border-collapse border border-gray-300 mt-3"
        >
          <thead>
            {headerGroups.map((headerGroups) => (
              <tr {...headerGroups.getHeaderGroupProps()}>
                {headerGroups.headers.map((c) => (
                  <th
                    {...c.getHeaderProps(c.getSortByToggleProps())}
                    className="px-4 py-2 bg-gray-200"
                  >
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
    </div>
  );
}
