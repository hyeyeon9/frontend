import { useEffect, useMemo, useState } from "react"
import { useSortBy, useTable } from "react-table"
import {
  fetchDisposalByDate,
  fetchManualDisposal,
  fetchPendingDisposal,
} from "../api/HttpDisposalService"
import { FormatDate } from "../components/FormatDate"
import { Link } from "react-router-dom"
import { AlertTriangle, BarChart, Calendar, CheckCircle, ChevronDown, Clock, Filter, Info, Trash2, X } from 'lucide-react'

export function getToday() {
  return new Date().toISOString().split("T")[0] // "2025-03-24"
}

function DisposalList() {
  const [disposal, setDisposal] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState(getToday()) // "2025-03-24"

  const [showModal, setShowModal] = useState(false) // 모달 열림/닫힘 상태
  const [pendingList, setPendingList] = useState([]) // 폐기 예정 항목
  const [selectedBatches, setSelectedBatches] = useState([]) // 체크된 배치 ID

  const [pendingCount, setPendingCount] = useState(0)
  const [filterType, setFilterType] = useState("all") // 'all', 'auto', 'manual'
  const [processingDisposal, setProcessingDisposal] = useState(false)

  // 폐기 테이블 불러오기 (새롭게 업데이트 될때마다 불러옴)
  useEffect(() => {
    async function getDisposalList() {
      try {
        setLoading(true)
        const data = await fetchDisposalByDate(selectedDate)
        setDisposal(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    getDisposalList()
  }, [selectedDate, showModal])

  // 폐기 예정 아이템 개수를 가져오기 위해서
  useEffect(() => {
    async function loadPendingDisposal() {
      try {
        const pendingItems = await fetchPendingDisposal()
        setPendingCount(pendingItems.length)
      } catch (error) {
        console.error("폐기 예정 항목 가져오기 실패", error.message)
      }
    }
    loadPendingDisposal()
  }, [disposal])

  // 테이블 헤더
  const columns = useMemo(
    () => [
      { 
        Header: "폐기코드", 
        accessor: "disposal_id",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>
      },
      { 
        Header: "입고코드", 
        accessor: "batch_id",
        Cell: ({ value }) => <span className="font-mono text-xs">{value}</span>
      },
      { Header: "폐기상품", accessor: "goods_name" },
      { 
        Header: "폐기시간", 
        accessor: "disposed_at",
        Cell: ({ value }) => <span>{FormatDate(value)}</span>
      },
      { 
        Header: "폐기수량", 
        accessor: "disposed_quantity",
        Cell: ({ value }) => <span className="font-medium">{value}개</span>
      },
      { 
        Header: "폐기이유", 
        accessor: "disposal_reason",
        Cell: ({ value }) => {
          if (value === "유통기한 만료(수동)") {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <Clock className="w-3 h-3 mr-1" />
                수동 폐기
              </span>
            )
          } else if (value === "유통기한 만료") {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                자동 폐기
              </span>
            )
          }
          return value
        }
      },
    ],
    []
  )

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (filterType === "all") return disposal
    if (filterType === "auto") return disposal.filter(item => item.disposal_reason === "유통기한 만료")
    if (filterType === "manual") return disposal.filter(item => item.disposal_reason === "유통기한 만료(수동)")
    return disposal
  }, [disposal, filterType])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: filteredData }, useSortBy)

  // 수정 폐기처리 버튼
  async function handleManualDisposal() {
    if (selectedBatches.length === 0) {
      alert("폐기할 항목을 선택해주세요.")
      return
    }
    
    setProcessingDisposal(true)
    try {
      const response = await fetchManualDisposal(selectedBatches)
      alert("선택한 항목이 성공적으로 폐기되었습니다.")
    } catch (error) {
      alert(`폐기 처리 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setProcessingDisposal(false)
      setShowModal(false)
    }
  }

  // 폐기 수동 처리시 아이템 선택 톼글
  function toggleBatch(batchId) {
    if (selectedBatches.includes(batchId)) {
      // 있으면 빼고
      setSelectedBatches(selectedBatches.filter((b) => b !== batchId))
    } else {
      // 없으면 넣자.
      setSelectedBatches([...selectedBatches, batchId])
    }
  }

  // 전체 선택/해제
  function toggleSelectAll(checked) {
    if (checked) {
      setSelectedBatches(pendingList.map(item => item.batchId))
    } else {
      setSelectedBatches([])
    }
  }

  async function openDisposalModal() {
    try {
      const response = await fetchPendingDisposal()
      setPendingList(response)
      setSelectedBatches(response.map((item) => item.batchId))
      setShowModal(true)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 네비게이션 탭 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <Link 
              to="/disposal" 
              className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium flex items-center"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              폐기 내역
            </Link>
            <Link
              to="/disposal/analyze"
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex items-center"
            >
              <BarChart className="h-4 w-4 mr-2" />
              폐기 통계
            </Link>
          </div>
        </div>

        {/* 필터 및 컨트롤 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filterType === "all" 
                        ? "bg-white text-indigo-700 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setFilterType("auto")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filterType === "auto" 
                        ? "bg-white text-indigo-700 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    자동
                  </button>
                  <button
                    onClick={() => setFilterType("manual")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filterType === "manual" 
                        ? "bg-white text-indigo-700 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    수동
                  </button>
                </div>
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
                onClick={openDisposalModal}
                className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                폐기 처리
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
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
              <table
                {...getTableProps()}
                className="w-full border-collapse"
              >
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-50 border-b border-gray-200">
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            {column.render("Header")}
                            <span className="ml-1" key={column.id}>
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
                    prepareRow(row)
                    return (
                      <tr 
                        {...row.getRowProps()} 
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
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
          )}
        </div>
      </div>

      {/* 폐기 처리 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Trash2 className="h-5 w-5 mr-2 text-red-500" />
                  폐기 예정 리스트
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {pendingList.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  폐기 예정 항목이 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={selectedBatches.length === pendingList.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">전체 선택</label>
                  </div>
                  
                  {pendingList.map((item) => (
                    <div 
                      key={item.batchId}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBatches.includes(item.batchId)}
                        onChange={() => toggleBatch(item.batchId)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-800">{item.goodsName}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="inline-flex items-center mr-3">
                            <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                            유통기한: {item.expirationDate.split("T")[0]}
                          </span>
                          <span className="inline-flex items-center">
                            <Trash2 className="h-3 w-3 mr-1 text-red-500" />
                            수량: {item.stockQuantity}개
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleManualDisposal}
                disabled={selectedBatches.length === 0 || processingDisposal}
                className={`px-4 py-2 rounded-lg text-white flex items-center ${
                  selectedBatches.length === 0 || processingDisposal
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } transition-colors`}
              >
                {processingDisposal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    처리 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    선택 폐기처리
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DisposalList;