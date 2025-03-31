"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchDisposalByDate } from "../api/HttpDisposalService"
import { Trash2, ArrowRight } from "lucide-react"

export default function DisposalToday() {
  const [disposal, setDisposal] = useState([])

  useEffect(() => {
    async function getDisposalByDate() {
      try {
        const today = getToday()
        const data = await fetchDisposalByDate(today)
        setDisposal(data)
      } catch (error) {
        console.error("Failed to fetch disposal items:", error)
      }
    }
    getDisposalByDate()
  }, [])

  // Get today's date in YYYY-MM-DD format
  function getToday() {
    const date = new Date()
    return date.toISOString().split("T")[0]
  }

  return (
    <div className="bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-800">오늘 폐기된 항목</h2>
        </div>
      </div>
      <div className="px-4 pb-2">
        {disposal.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">오늘은 폐기된 항목이 없습니다.</p>
        ) : (
          <div className="max-h-[120px] overflow-y-auto pr-1">
            <div className="space-y-2">
              {disposal.map((item) => (
                <div
                  key={item.disposal_id}
                  className="flex items-center justify-between py-1 border-b border-red-100 last:border-0"
                >
                  <div className="font-medium">{item.goods_name}</div>
                  <div className="text-sm text-gray-500">{item.disposed_quantity}개 폐기됨</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {disposal.length > 3 && (
        <div className="px-4 pb-3 text-right">
          <Link
            to="/disposal"
            className="inline-flex items-center text-sm text-red-700 hover:text-red-900 hover:underline"
          >
            전체 보기 <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  )
}

