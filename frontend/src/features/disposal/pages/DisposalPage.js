"use client";

import { useEffect, useMemo, useState } from "react";
import { useSortBy, useTable } from "react-table";
import { fetchDisposalByDate } from "../api/HttpDisposalService";
import { FormatDate } from "../components/FormatDate";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  BarChart,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  X,
} from "lucide-react";
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService";
import CustomDatePicker from "../../../components/CustomDatePicker";

export function getToday() {
  return new Date().toISOString().split("T")[0]; // "2025-03-24"
}

function DisposalList() {
  const location = useLocation();
  const [disposal, setDisposal] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(getToday()); // "2025-03-24"

  const [showModal, setShowModal] = useState(false); // 모달 열림/닫힘 상태
  const [pendingList, setPendingList] = useState([]); // 폐기 예정 항목

  const [pendingCount, setPendingCount] = useState(0);
  const [loadingPending, setLoadingPending] = useState(false);

  // 폐기 테이블 불러오기 (새롭게 업데이트 될때마다 불러옴)
  useEffect(() => {
    async function getDisposalList() {
      try {
        setLoading(true);
        const data = await fetchDisposalByDate(selectedDate);
        setDisposal(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getDisposalList();
  }, [selectedDate, showModal]);

  // 폐기 예정 아이템 개수를 가져오기 위해서
  useEffect(() => {
    async function loadPendingDisposal() {
      try {
        const expiringItems = await fetchExpiringItems();
        console.log("expiringItems", expiringItems);

        const today = new Date();
        const oneDayLater = new Date(today);
        oneDayLater.setDate(today.getDate() + 1);

        // 유통기한이 1일인 애들만 가져오기
        const filtered = expiringItems.filter((item) => {
          const expDate = new Date(item.expirationDate);
          const diff = (expDate - today) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff < 1;
        });

        setPendingCount(filtered.length);
        setPendingList(filtered); // 필터링된 목록 저장
      } catch (error) {
        console.error("폐기 예정 항목 가져오기 실패", error.message);
      }
    }
    loadPendingDisposal();
  }, [disposal]);

  // 폐기 예정 상품 버튼 클릭 시 모달 열기
  const handleOpenPendingModal = async () => {
    setLoadingPending(true);
    try {
      const expiringItems = await fetchExpiringItems();

      const today = new Date();
      // 유통기한이 1일인 애들만 가져오기
      const filtered = expiringItems.filter((item) => {
        const expDate = new Date(item.expirationDate);
        const diff = (expDate - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 1;
      });

      setPendingList(filtered);
      setShowModal(true);
    } catch (error) {
      console.error("폐기 예정 항목 가져오기 실패", error.message);
    } finally {
      setLoadingPending(false);
    }
  };

  // 테이블 헤더
  const columns = useMemo(
    () => [
      {
        Header: "폐기코드",
        accessor: "disposal_id",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        Header: "입고코드",
        accessor: "batch_id",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>,
      },
      { Header: "폐기상품", accessor: "goods_name" },
      {
        Header: "폐기시간",
        accessor: "disposed_at",
        Cell: ({ value }) => <span>{FormatDate(value)}</span>,
      },
      {
        Header: "폐기수량",
        accessor: "disposed_quantity",
        Cell: ({ value }) => <span className="font-medium">{value}개</span>,
      },
      {
        Header: "폐기이유",
        accessor: "disposal_reason",
        Cell: ({ value }) => {
          return value;
        },
      },
    ],
    []
  );

  // 필터링된 데이터
  const filteredData = useMemo(() => disposal, [disposal]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: filteredData }, useSortBy);

  // 남은 시간 계산 함수
  const getTimeRemaining = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffMs = expDate - now;

    // 시간, 분 계산
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours <= 0 && minutes <= 0) {
      return "만료됨";
    }

    return `${hours}시간 ${minutes}분`;
  };

  // 유통기한 날짜 포맷팅
  const formatExpirationDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 네비게이션 탭 */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link
            to="/disposal"
            className={`flex items-center px-4 py-3 ${
              location.pathname === "/disposal"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            폐기 내역
          </Link>
          <Link
            to="/disposal/analyze"
            className={`flex items-center px-4 py-3 ${
              location.pathname.includes("/disposal/analyze")
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            <BarChart className="h-5 w-5 mr-2" />
            폐기 통계
          </Link>
        </div>

        {/* 필터 및 컨트롤 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {/* 왼쪽 화살표 */}
                <button
                  onClick={() => {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const y = prevDate.getFullYear();
                    const m = String(prevDate.getMonth() + 1).padStart(2, "0");
                    const d = String(prevDate.getDate()).padStart(2, "0");
                    setSelectedDate(`${y}-${m}-${d}`);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                {/* 날짜 선택기 */}
                <div className="w-[220px]">
                  <CustomDatePicker
                    selectedDate={new Date(selectedDate)}
                    onChange={(date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      setSelectedDate(`${year}-${month}-${day}`);
                    }}
                    label={null}
                  />
                </div>

                {/* 오른쪽 화살표 */}
                <button
                  onClick={() => {
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    const y = nextDate.getFullYear();
                    const m = String(nextDate.getMonth() + 1).padStart(2, "0");
                    const d = String(nextDate.getDate()).padStart(2, "0");
                    setSelectedDate(`${y}-${m}-${d}`);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedDate === getToday() && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  오늘 {disposal.length}개의 항목이 폐기되었습니다.
                </div>
              )}

              <button
                onClick={handleOpenPendingModal}
                className="relative px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                disabled={loadingPending}
              >
                {loadingPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    로딩 중...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    폐기 예정 상품
                    {pendingCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <Info className="h-12 w-12 mb-2 text-gray-400" />
              <p>해당 날짜에 폐기 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table {...getTableProps()} className="w-full border-collapse">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr
                      {...headerGroup.getHeaderGroupProps()}
                      className="bg-gray-50 border-b border-gray-200"
                      key={headerGroup.id}
                    >
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          key={column.id}
                        >
                          <div className="flex items-center">
                            {column.render("Header")}
                            <span className="ml-1">
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 transform rotate-180" />
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

                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        key={row.id}
                      >
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                            key={cell.column.id}
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
          )}
        </div>
      </div>

      {/* 폐기 예정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  폐기 예정 상품 목록
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                유통기한이 24시간 이내로 남은 상품 목록입니다. 총{" "}
                {pendingList.length}개 항목이 있습니다.
              </p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {pendingList.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  폐기 예정 항목이 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 text-xs font-medium text-gray-500 uppercase px-4 pb-2 border-b">
                    <div className="col-span-5">상품명</div>
                    <div className="col-span-2 text-center">수량</div>
                    <div className="col-span-3">유통기한</div>
                    <div className="col-span-2 text-right">남은 시간</div>
                  </div>

                  {pendingList.map((item) => {
                    const timeRemaining = getTimeRemaining(item.expirationDate);
                    const isUrgent =
                      timeRemaining.includes("시간") &&
                      Number.parseInt(timeRemaining.split("시간")[0]) < 6;

                    return (
                      <div
                        key={item.batchId}
                        className={`grid grid-cols-12 items-center p-4 rounded-lg border ${
                          isUrgent
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        } transition-colors`}
                      >
                        <div className="col-span-5">
                          <div className="font-medium text-gray-800">
                            {item.goodsName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            입고코드:{" "}
                            <span className="font-mono">{item.batchId}</span>
                          </div>
                        </div>

                        <div className="col-span-2 text-center">
                          <span className="font-medium text-gray-800">
                            {item.stockQuantity}개
                          </span>
                        </div>

                        <div className="col-span-3">
                          <span className="text-gray-700">
                            {formatExpirationDate(item.expirationDate)}
                          </span>
                        </div>

                        <div className="col-span-2 text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isUrgent
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {timeRemaining}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisposalList;
