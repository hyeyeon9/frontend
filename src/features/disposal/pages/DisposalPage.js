import { useEffect, useMemo, useState } from "react";

import { useSortBy, useTable } from "react-table";
import {
  fetchCheckDisposal,
  fetchDisposal,
  fetchDisposalByDate,
  fetchManualDisposal,
  fetchPendingDisposal,
} from "../api/HttpDisposalService";
import { FormatDate, formatDate } from "../components/FormatDate";

function getToday() {
  return new Date().toISOString().split("T")[0]; // "2025-03-24"
}

function DispoalList() {
  const [disposal, setDisposal] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(getToday()); // "2025-03-24"

  const [showModal, setShowModal] = useState(false); // 모달 열림/닫힘 상태
  const [pendingList, setPendingList] = useState([]); // 폐기 예정 항목
  const [selectedBatches, setSelectedBatches] = useState([]); // 체크된 배치 ID

  // 폐기 테이블 불러오기 (새롭게 업데이트 될때마다 불러옴)
  useEffect(() => {
    async function getDisposalList() {
      try {
        const data = await fetchDisposalByDate(selectedDate);
        console.log(data);
        setDisposal(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getDisposalList();
  }, [selectedDate, showModal]);

  // 테이블 헤더
  const columns = useMemo(
    () => [
      { Header: "페기코드", accessor: "disposal_id" },
      { Header: "폐기상품", accessor: "goods_name" },
      { Header: "폐기시간", accessor: "disposed_at" },
      { Header: "폐기수량", accessor: "disposed_quantity" },
      { Header: "폐기이유", accessor: "disposal_reason" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: disposal }, useSortBy);

  // 수정 폐기처리 버튼
  async function handleManualDisposal() {
    console.log("폐기 처리 버튼");
    try {
      const response = await fetchManualDisposal(selectedBatches);
      console.log(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setShowModal(false);
    }
  }

  // 폐기 수동 처리시 아이템 선택 톼글
  function toggleBatch(batchId) {
    if (selectedBatches.includes(batchId)) {
      // 있으면 빼고
      setSelectedBatches(selectedBatches.filter((b) => b !== batchId));
    } else {
      // 없으면 넣자.
      setSelectedBatches([...selectedBatches, batchId]);
    }
  }

  async function openDisposalModal() {
    try {
      const response = await fetchPendingDisposal();
      setPendingList(response);
      setSelectedBatches(response.map((item) => item.batchId));
      setShowModal(true);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <>
      <div>
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 mb-3"
          />

          <button
            onClick={openDisposalModal}
            className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-700"
          >
            폐기 처리
          </button>
        </div>

        <table
          {...getTableProps()}
          border="1"
          className="w-full border-collapse border border-gray-300 mt-3"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((c) => (
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
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} className="px-2 py-3 border">
                        {cell.column.id === "disposed_at"
                          ? FormatDate(cell.value)
                          : cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[500px] max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">🗑 폐기 예정 리스트</h2>
            {pendingList.map((item) => (
              <div key={item.batchId} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedBatches.includes(item.batchId)}
                  onChange={() => toggleBatch(item.batchId)}
                  className="mr-2"
                />
                <span>
                  [{item.goodsName}] {item.stockQuantity}개 (유통기한{" "}
                  {item.expirationDate.split("T")[0]})
                </span>
              </div>
            ))}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-3 py-1 rounded"
              >
                취소
              </button>
              <button
                onClick={handleManualDisposal}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                선택 폐기처리
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DispoalList;
