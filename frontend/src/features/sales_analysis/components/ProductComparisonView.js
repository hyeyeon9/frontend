"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { fetchGetDailySalesByDateAndHour } from "../api/HttpSalesAnalysisService"
import SalesComparisonChart from "./SalesComparisonChart"

export default function ProductComparisonView({ selectedAlert, comment, setComment, getPreviousDate }) {
  const [productData, setProductData] = useState({
    previousData: [],
    currentData: [],
  })

  const [loading, setLoading] = useState(true)

  // 컴포넌트가 마운트될 때 데이터 로드
  useEffect(() => {
    const fetchProductData = async () => {
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
          previousData: previousResponse.data, // API 응답 구조에 맞게 변경
          currentData: currentResponse.data, // API 응답 구조에 맞게 변경
        })
      } catch (error) {
        console.error("데이터를 가져오는 데 실패했습니다.", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductData()
  }, [selectedAlert])

  const getSalesChange = (prevPrice, currPrice) => {
    if (prevPrice === 0) {
      return {
        icon: <TrendingUp className="w-4 h-4 text-blue-600" />, // 신규 상품
        text: `${currPrice.toLocaleString()}원 (새 상품)`,
        className: "text-blue-600",
      }
    }

    const change = currPrice - prevPrice
    const percentageChange = ((change / prevPrice) * 100).toFixed(1)

    if (change > 0) {
      return {
        icon: <TrendingUp className="w-4 h-4 text-green-600" />,
        text: `+${change.toLocaleString()}원 (+${percentageChange}%)`,
        className: "text-green-600",
      }
    } else if (change < 0) {
      return {
        icon: <TrendingDown className="w-4 h-4 text-red-600" />,
        text: `${change.toLocaleString()}원 (${percentageChange}%)`,
        className: "text-red-600",
      }
    } else {
      return {
        icon: <Minus className="w-4 h-4 text-gray-500" />,
        text: "변화 없음",
        className: "text-gray-500",
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const previousTotal = productData.previousData.reduce((sum, item) => sum + item.totalPrice, 0)
  const currentTotal = productData.currentData.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* 테이블 영역 - 가로 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽: 7일 전 데이터 */}
        <div>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              7일 전 ({getPreviousDate(selectedAlert.alertDate)}) {selectedAlert.alertHour}시 판매 기록
            </h3>
            <p className="text-sm text-gray-500">
              총 판매액: <span className="font-medium">{previousTotal.toLocaleString()}원</span>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden text-xs">
            <div className="max-h-[240px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-leftfont-medium text-gray-500">상품명</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">수량</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">판매액</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.previousData.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-3 text-gray-800">{product.productName}</td>
                      <td className="px-4 py-3 text-gray-800">{product.totalAmount}개</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{product.totalPrice.toLocaleString()}원</td>
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
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              현재 ({selectedAlert.alertDate}) {selectedAlert.alertHour}시 판매 기록
            </h3>
            <p className="text-sm text-gray-500">
              총 판매액: <span className="font-medium text-indigo-600">{currentTotal.toLocaleString()}원</span>
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
                    const prevProduct = productData.previousData.find((p) => p.productId === product.productId)

                    const salesChange = prevProduct
                      ? getSalesChange(prevProduct.totalPrice, product.totalPrice)
                      : {
                          icon: <TrendingUp className="w-4 h-4 text-green-600" />,
                          text: `${product.totalPrice.toLocaleString()}원 (new!)`,
                          className: "text-blue-600",
                        }

                    return (
                      <tr key={product.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="px-4 py-3 text-gray-800">{product.productName}</td>
                        <td className="px-4 py-3 text-gray-800">{product.totalAmount}개</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{product.totalPrice.toLocaleString()}원</td>
                        <td className="px-4 py-3">
                          {salesChange && (
                            <div className="flex items-center">
                              {salesChange.icon}
                              <span className={`ml-1 ${salesChange.className}`}>{salesChange.text}</span>
                            </div>
                          )}
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

      {/* 차트 영역 */}
      <div className="mt-6">
        <SalesComparisonChart
          previousData={productData.previousData}
          currentData={productData.currentData}
          previousDate={getPreviousDate(selectedAlert.alertDate)}
          currentDate={selectedAlert.alertDate}
          hourLabel={selectedAlert.alertHour}
        />
      </div>
    </div>
  )
}

