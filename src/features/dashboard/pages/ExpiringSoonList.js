"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService"
import { Clock, ArrowRight } from "lucide-react"

export default function ExpiringSoonList() {
  const [items, setItems] = useState([])

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
    <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-200 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-amber-800">유통기한 임박 상품</h2>
        </div>
      </div>
      <div className="px-4 pb-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">임박한 상품이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 3).map((item) => {
              const daysLeft = getDaysUntil(item.expirationDate)
              const badgeVariant = getBadgeVariant(daysLeft)

              return (
                <div
                  key={item.batchId}
                  className="flex items-center justify-between py-1 border-b border-amber-100 last:border-0"
                >
                  <div className="font-medium">{item.goodsName}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{item.stockQuantity}개</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badgeVariant}`}
                    >
                      {daysLeft <= 0 ? "오늘" : `${daysLeft}일 남음`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {items.length > 3 && (
        <div className="px-4 pb-3 text-right">
          <Link
            to="/expiring-items"
            className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
          >
            전체 보기 <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  )
}

