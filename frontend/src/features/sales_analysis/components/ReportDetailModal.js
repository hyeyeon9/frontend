"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import SalesComparisonChart from "./SalesComparisonChart"
import { fetchGetDailySalesByDateAndHour, fetchUpdateComment } from "../api/HttpSalesAnalysisService"
import { Button } from "flowbite-react"

export default function ReportDetailModal({ selectedAlert, isInline = false, closeModal }) {
  const [comment, setComment] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [productData, setProductData] = useState({
    previousData: [],
    currentData: [],
  })
  const [loading, setLoading] = useState(false)

  // 트렌드 매핑
  const trendMapping = {
    1: "요일 비교",
    7: "7일 평균",
    30: "30일 평균",
  }

  // 선택된 알림이 변경될 때 코멘트 초기화
  useEffect(() => {
    if (selectedAlert) {
      setComment(selectedAlert.userComment || "")

      // 요일 비교인 경우 자동으로 상세 데이터 로드
      if (selectedAlert.trendBasis === 1) {
        setShowDetails(true)
        loadProductData()
      } else {
        setShowDetails(false)
      }
    }
  }, [selectedAlert])

  // 날짜 포맷 변환 및 7일 전 날짜 계산 함수
  const getPreviousDate = (dateString) => {
    const date = new Date(dateString)
    date.setDate(date.getDate() - 7)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // 상품 데이터 로드 함수
  const loadProductData = async () => {
    if (!selectedAlert || selectedAlert.trendBasis !== 1) return

    setLoading(true)
    try {
      // 7일 전 데이터
      const previousResponse = await fetchGetDailySalesByDateAndHour(
        getPreviousDate(selectedAlert.alertDate),
        selectedAlert.alertHour,
      )
      // 선택한 날짜의 데이터
      const currentResponse = await fetchGetDailySalesByDateAndHour(selectedAlert.alertDate, selectedAlert.alertHour)

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
    if (!showDetails && selectedAlert.trendBasis === 1) {
      loadProductData()
    }
    setShowDetails(!showDetails)
  }

  // 코멘트 업데이트 API 호출
  const handleUpdateComment = async () => {
    if (!selectedAlert) return

    try {
      await fetchUpdateComment(selectedAlert.alertId, comment)
      // 성공 메시지 또는 상태 업데이트
      alert("코멘트가 저장되었습니다.")
    } catch (error) {
      console.error("코멘트 수정 실패:", error)
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
                {selectedAlert.alertDate} {selectedAlert.alertHour}시
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

          {/* 요일 비교일 경우에만 상세 보기 버튼 표시 */}
          {selectedAlert.trendBasis === 1 && !showDetails && (
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

          {/* 상세 분석 영역 (요일 비교일 경우에만) */}
          {showDetails && selectedAlert.trendBasis === 1 && (
            <div className="mb-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 차트 영역 */}
                  <SalesComparisonChart
                    previousData={productData.previousData}
                    currentData={productData.currentData}
                    previousDate={getPreviousDate(selectedAlert.alertDate)}
                    currentDate={selectedAlert.alertDate}
                    hourLabel={selectedAlert.alertHour}
                  />

                  {/* 상품별 비교 영역 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">상품별 판매 비교</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 왼쪽: 7일 전 데이터 */}
                      <div>
                        <div className="mb-4">
                          <h4 className="text-base font-semibold text-gray-700 mb-2">
                            7일 전 ({getPreviousDate(selectedAlert.alertDate)}) {selectedAlert.alertHour}시 판매 기록
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
                            현재 ({selectedAlert.alertDate}) {selectedAlert.alertHour}시 판매 기록
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
          </div>
        </div>
      </div>
    </div>
  )
}

