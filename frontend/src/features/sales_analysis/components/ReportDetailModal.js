"use client"

import { useState, useEffect } from "react"
import { X, Trash2 } from "lucide-react"
import SalesComparisonChart from "./SalesComparisonChart"
import { fetchGetDailySalesByDateAndHour, fetchUpdateComment } from "../api/HttpSalesAnalysisService"
import { Button } from "flowbite-react"

export default function ReportDetailModal({ selectedAlert, isInline = false, closeModal }) {
  const [comment, setComment] = useState("")
  const [savedComments, setSavedComments] = useState([]) // 저장된 코멘트를 관리하는 상태 추가
  const [showDetails, setShowDetails] = useState(true)
  const [productData, setProductData] = useState({
    previousData: [],
    currentData: [],
  })
  const [loading, setLoading] = useState(false)

  // 트렌드 매핑
  const trendMapping = {
    1: "일주일 전 대비",
    2: "1개월 전 대비",
    3: "1년 전 대비",
  }

  // 선택된 알림이 변경될 때 코멘트 초기화
  useEffect(() => {
    if (selectedAlert) {
      setComment(selectedAlert.userComment || "")
      // 저장된 코멘트가 있으면 초기 savedComments에 추가
      if (selectedAlert.userComment) {
        setSavedComments([
          {
            id: Date.now(),
            text: selectedAlert.userComment,
            timestamp: new Date().toLocaleString(),
          },
        ])
      } else {
        setSavedComments([])
      }

      // 자동으로 상세 데이터 로드
      loadProductData()
    }
  }, [selectedAlert])

  // 날짜 포맷 변환 및 이전 날짜 계산 함수
  const getPreviousDateByTrend = (dateString, trendBasis) => {
    const date = new Date(dateString)

    if (trendBasis === 1) date.setDate(date.getDate() - 7)
    else if (trendBasis === 2) date.setMonth(date.getMonth() - 1)
    else if (trendBasis === 3) date.setFullYear(date.getFullYear() - 1)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // 날짜(요일) 포맷으로 변환
  const formatDateWithDay = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day) // 문자열 파싱 후 안정적인 생성

    const dayOfWeek = date.toLocaleDateString("ko-KR", {
      weekday: "short", // "월", "화", ...
    })

    return `${dateString} (${dayOfWeek})`
  }

  // 상품 데이터 로드 함수
  const loadProductData = async () => {
    if (!selectedAlert) return

    const { trendBasis, alertDate, alertHour } = selectedAlert
    setLoading(true)

    try {
      const previousDate = getPreviousDateByTrend(alertDate, trendBasis)

      const [previousResponse, currentResponse] = await Promise.all([
        fetchGetDailySalesByDateAndHour(previousDate, alertHour),
        fetchGetDailySalesByDateAndHour(alertDate, alertHour),
      ])

      setProductData({
        previousData: previousResponse.data,
        currentData: currentResponse.data,
      })
    } catch (error) {
      console.error("데이터를 가져오는 데 실패했습니다.", error)
    } finally {
      setLoading(false)
    }
  }

  // 상세 보기 토글
  const toggleDetails = () => {
    if (!showDetails) {
      loadProductData()
    }
    setShowDetails(!showDetails)
  }

  // 코멘트 업데이트 API 호출
  const handleUpdateComment = async () => {
    if (!selectedAlert || !comment.trim()) return

    try {
      await fetchUpdateComment(selectedAlert.alertId, comment)

      // 저장된 코멘트 목록에 추가
      const newComment = {
        id: Date.now(),
        text: comment,
        timestamp: new Date().toLocaleString(),
      }

      setSavedComments([...savedComments, newComment])

      // 성공 메시지 또는 상태 업데이트
      alert("코멘트가 저장되었습니다.")

      // 코멘트 입력창 비우기
      setComment("")
    } catch (error) {
      console.error("코멘트 수정 실패:", error)
    }
  }

  // 코멘트 삭제 함수
  const handleDeleteComment = (commentId) => {
    // 삭제 확인
    if (window.confirm("정말로 이 코멘트를 삭제하시겠습니까?")) {
      // 해당 ID를 제외한 코멘트만 필터링하여 상태 업데이트
      const updatedComments = savedComments.filter((comment) => comment.id !== commentId)
      setSavedComments(updatedComments)

      // 서버에도 삭제 요청을 보낼 수 있음 (필요한 경우)
      // 현재는 로컬 상태만 업데이트

      alert("코멘트가 삭제되었습니다.")
    }
  }

  return (
    <div
      className={
        isInline
          ? ""
          : "fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4 overflow-y-auto"
      }
    >
      <div
        className={`bg-white ${
          isInline ? "" : "rounded-xl shadow-sm p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">{selectedAlert.alertHour}시 매출 상세 정보</h2>
          </div>
          {!isInline && (
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* 기본 요약 정보 */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-base text-gray-500 mb-1">날짜 / 시간</p>
              <p className="text-base font-medium">
                {formatDateWithDay(selectedAlert.alertDate)} {selectedAlert.alertHour}시
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500 mb-1">트렌드 기준</p>
              <p className="text-base font-medium">{trendMapping[selectedAlert.trendBasis] || "-"}</p>
            </div>
          </div>

          {/* 매출량 비교 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">매출량 비교</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">이전 매출</p>
                <p className="text-base font-medium">{Number(selectedAlert.previousSales).toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">현재 매출</p>
                <p className="text-base font-semibold text-indigo-600">
                  {Number(selectedAlert.currentSales).toLocaleString()}원
                </p>
              </div>

              <div className="col-span-2">
                <div className="flex flex-row items-center gap-3">
                  <p className="text-sm text-gray-500 mb-1">변화량</p>
                  {selectedAlert.difference > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      +{Number(selectedAlert.difference).toLocaleString()}원 증가 (
                      {Math.round((selectedAlert.difference / selectedAlert.previousSales) * 100)}
                      %)
                    </span>
                  ) : selectedAlert.difference < 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {Number(selectedAlert.difference).toLocaleString()}원 감소 (
                      {Math.round((selectedAlert.difference / selectedAlert.previousSales) * 100)}
                      %)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      변화 없음
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">알림 메시지</p>
            <div className="inline-block max-w-full">
              <div className="px-2.5 py-0.5 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 overflow-hidden">
                <span className="whitespace-pre-wrap break-words">{selectedAlert.alertMessage}</span>
              </div>
            </div>
          </div>

          {/* 상세 보기 버튼 */}
          {!showDetails && (
            <div className="mb-4">
              <button
                className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center text-base"
                onClick={toggleDetails}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                상세 분석 보기
              </button>
            </div>
          )}

          {/* 상세 분석 영역 */}
          {showDetails && (
            <div className="mb-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="space-y-6 h-full">
                  {/* 차트 영역 */}
                  <SalesComparisonChart
                    previousData={productData.previousData}
                    currentData={productData.currentData}
                    previousDate={formatDateWithDay(
                      getPreviousDateByTrend(selectedAlert.alertDate, selectedAlert.trendBasis),
                    )}
                    currentDate={formatDateWithDay(selectedAlert.alertDate)}
                    hourLabel={selectedAlert.alertHour}
                    trendBasis={selectedAlert.trendBasis}
                  />

                  {/* 상품별 비교 영역 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">상품별 판매 비교</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 왼쪽: 이전 데이터 */}
                      <div>
                        <div className="mb-4">
                          <h4 className="text-base font-semibold text-gray-700 mb-2">
                            {trendMapping[selectedAlert.trendBasis]?.replace(" 대비", "")}
                            {" : "}
                            {formatDateWithDay(
                              getPreviousDateByTrend(selectedAlert.alertDate, selectedAlert.trendBasis),
                            )}{" "}
                            {selectedAlert.alertHour}시 판매 기록
                          </h4>
                          <p className="text-sm text-gray-500">
                            총 판매액:{" "}
                            <span className="font-medium">
                              {productData.previousData
                                .reduce((sum, item) => sum + item.totalPrice, 0)
                                .toLocaleString()}
                              원
                            </span>
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg overflow-hidden text-xs">
                          <div className="max-h-[240px] overflow-y-auto">
                            <table className="w-full border-collapse">
                              <thead className="sticky top-0 bg-gray-100 z-10">
                                <tr className="border-b border-gray-200">
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">상품명</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">수량</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">판매액</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productData.previousData.map((product) => (
                                  <tr key={product.id} className="border-b border-gray-100 last:border-b-0">
                                    <td className="px-4 py-3 text-gray-800">{product.productName}</td>
                                    <td className="px-4 py-3 text-gray-800">{product.totalAmount}개</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                      {product.totalPrice.toLocaleString()}원
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 현재 데이터 */}
                      <div>
                        <div className="mb-4">
                          <h4 className="text-base font-semibold text-gray-700 mb-2">
                            현재 {" : "}
                            {formatDateWithDay(selectedAlert.alertDate)} {selectedAlert.alertHour}시 판매 기록
                          </h4>
                          <p className="text-sm text-gray-500">
                            총 판매액:{" "}
                            <span className="font-medium text-indigo-600">
                              {productData.currentData.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                              원
                            </span>
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg overflow-hidden text-xs">
                          <div className="max-h-[240px] overflow-y-auto">
                            <table className="w-full border-collapse">
                              <thead className="sticky top-0 bg-gray-100 z-10">
                                <tr className="border-b border-gray-200">
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">상품명</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">수량</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">판매액</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-500">변화</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productData.currentData.map((product) => {
                                  // 상품 ID를 기준으로 비교
                                  const prevProduct = productData.previousData.find(
                                    (p) => p.productId === product.productId,
                                  )

                                  // 변화량 계산
                                  let salesChange
                                  if (!prevProduct) {
                                    salesChange = {
                                      icon: <span className="text-blue-600">↗</span>,
                                      text: `${product.totalPrice.toLocaleString()}원 (new!)`,
                                      className: "text-blue-600",
                                    }
                                  } else {
                                    const change = product.totalPrice - prevProduct.totalPrice
                                    const percentageChange = ((change / prevProduct.totalPrice) * 100).toFixed(1)

                                    if (change > 0) {
                                      salesChange = {
                                        icon: <span className="text-green-600">↑</span>,
                                        text: `+${change.toLocaleString()}원 (+${percentageChange}%)`,
                                        className: "text-green-600",
                                      }
                                    } else if (change < 0) {
                                      salesChange = {
                                        icon: <span className="text-red-600">↓</span>,
                                        text: `${change.toLocaleString()}원 (${percentageChange}%)`,
                                        className: "text-red-600",
                                      }
                                    } else {
                                      salesChange = {
                                        icon: <span className="text-gray-500">-</span>,
                                        text: "변화 없음",
                                        className: "text-gray-500",
                                      }
                                    }
                                  }

                                  return (
                                    <tr key={product.id} className="border-b border-gray-100 last:border-b-0">
                                      <td className="px-4 py-3 text-gray-800">{product.productName}</td>
                                      <td className="px-4 py-3 text-gray-800">{product.totalAmount}개</td>
                                      <td className="px-4 py-3 font-medium text-gray-800">
                                        {product.totalPrice.toLocaleString()}원
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center">
                                          {salesChange.icon}
                                          <span className={`ml-1 ${salesChange.className}`}>{salesChange.text}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 접기 버튼 */}
                  <div className="flex justify-center mt-4">
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      onClick={toggleDetails}
                    >
                      상세 분석 접기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 코멘트 영역 */}
          <div className="mt-4">
            <label className="block text-base font-medium text-gray-700 mb-2">코멘트</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical text-base"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="이 시간대의 매출 변화에 대한 코멘트를 입력하세요..."
            />

            <div className="flex justify-end gap-3 mt-4">
              {!isInline && (
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base"
                  onClick={closeModal}
                >
                  취소
                </button>
              )}
              <Button color="blue" onClick={handleUpdateComment}>
                저장
              </Button>
            </div>

            {/* 저장된 코멘트 표시 영역 */}
            {savedComments.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-base font-medium text-gray-700 mb-2">저장된 코멘트</h3>
                <div className="space-y-3">
                  {savedComments.map((savedComment) => (
                    <div key={savedComment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{savedComment.text}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{savedComment.timestamp}</span>
                          <button
                            onClick={() => handleDeleteComment(savedComment.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="코멘트 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
