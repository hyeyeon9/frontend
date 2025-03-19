import { useMemo } from "react";
import {  useSortBy, useTable } from "react-table";


function AssociationTable({ data, filteringText }) {
  const columns = useMemo(
    () => [
      { Header: "상품 A", accessor: "itemset_a" },
      { Header: "상품 B", accessor: "itemset_b" },
      { Header: "지지도(support)", accessor: "support" },
      { Header: "신뢰도(confidence)", accessor: "confidence" },
      { Header: "향상도(lift)", accessor: "lift" },
    ],
    []
  );

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!filteringText) return data; // 검색어 없으면 전체 데이터 반환
    return data.filter(
      (row) =>
        row.itemset_a.includes(filteringText) ||
        row.itemset_b.includes(filteringText)
    );
  }, [data, filteringText]);

  // headerGroups : 테이블의 헤더를 그룹화한 배열 (headerGroups[0].headers 에 우리의 5개 헤더가 들어감)
  // useTable훅을 사용하면 테이블에 적용할 수 있는 5개의 함수를 제공해준다.
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: filteredData }, useSortBy); // useSortBy: 정렬, useFilters: 필터링

  return (
    <div className="w-[1000px] max-h-[calc(100vh-300px)] overflow-auto">
      <table
        {...getTableProps()}
        border="1"
        className="w-full border-collapse border border-gray-300 mt-3"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((c) => (
                // getSortByToggleProps : 헤더를 클릭할때마다 정렬 (내림차순/오름차순)
                <th
                  {...c.getHeaderProps(c.getSortByToggleProps())}
                  className="px-4 py-2 bg-gray-200"
                >
                  {c.render("Header")}
                  <span>
                    {c.isSorted ? (c.isSortedDesc ? " 🔽" : " 🔼") : ""}
                  </span>
                </th> // 동적 렌더링을 위헤 render 사용
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

export default AssociationTable;
