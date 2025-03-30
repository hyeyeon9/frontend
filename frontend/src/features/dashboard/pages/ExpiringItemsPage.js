"use client"

import { useEffect, useState } from "react"
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService"
import { Clock, AlertTriangle } from "lucide-react"

export default function ExpiringItemsPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function getExpiringItems() {
      try {
        const data = await fetchExpiringItems()
        setItems(data)
      } catch (error) {
        console.error("Failed to fetch expiring items:", error)
      }
    }
    getExpiringItems()
  }, [])

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const currentItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Calculate days until expiration
  const getDaysUntil = (dateString) => {
    const today = new Date()
    const expirationDate = new Date(dateString)
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get badge color based on days until expiration
  const getBadgeVariant = (days) => {
    if (days <= 1) return "bg-red-100 text-red-800"
    if (days <= 3) return "bg-amber-100 text-amber-800"
    return "bg-slate-100 text-slate-800"
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-6 w-6 text-amber-500" />
        <h1 className="text-2xl font-bold">유통기한 임박 상품 전체 목록</h1>
      </div>

      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-800">주의 필요</h3>
          <p className="text-amber-700 text-sm">상품을 확인하고 필요한 경우 폐기 처리하세요.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border p-6 text-center">
          <p className="text-gray-500 py-8">임박한 상품이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">상품 목록</h2>
              <p className="text-sm text-gray-500">총 {items.length}개의 상품이 유통기한에 임박했습니다</p>
            </div>
            <div className="rounded-md">
              <div className="grid grid-cols-12 border-b bg-gray-50 px-4 py-3 text-sm font-medium">
                <div className="col-span-6">상품명</div>
                <div className="col-span-2 text-center">수량</div>
                <div className="col-span-3 text-center">유통기한</div>
                <div className="col-span-1 text-right">남은 일수</div>
              </div>
              <div className="divide-y max-h-[450px] overflow-y-auto">
                {currentItems.map((item) => {
                  const daysLeft = getDaysUntil(item.expirationDate)
                  const badgeVariant = getBadgeVariant(daysLeft)

                  return (
                    <div
                      key={item.batchId}
                      className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-6 font-medium">{item.goodsName}</div>
                      <div className="col-span-2 text-center">{item.stockQuantity}개</div>
                      <div className="col-span-3 text-center">{item.expirationDate.split("T")[0]}</div>
                      <div className="col-span-1 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badgeVariant}`}
                        >
                          {daysLeft <= 0 ? "오늘" : `${daysLeft}일`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-md ${
                    page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

