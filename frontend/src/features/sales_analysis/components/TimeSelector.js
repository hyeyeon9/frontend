"use client"
import { Clock } from "lucide-react"

export default function TimeSelector({ salesData, selectedHour, onTimeSelect }) {
  // 시간대별로 데이터 그룹화
  const groupedByHour = salesData.reduce((acc, item) => {
    const hour = item.alertHour
    if (!acc[hour]) {
      acc[hour] = []
    }
    acc[hour].push(item)
    return acc
  }, {})

  // 시간대 정렬
  const sortedHours = Object.keys(groupedByHour).sort((a, b) => a - b)

  // 시간대 선택 함수
  const handleHourSelect = (hour) => {
    // 해당 시간의 첫 번째 데이터를 선택
    const data = groupedByHour[hour][0]
    onTimeSelect(hour, data)
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
        {sortedHours.map((hour) => {
          const data = groupedByHour[hour][0]
          const isPositive = data.difference > 0
          const isNegative = data.difference < 0

          return (
            <button
              key={hour}
              onClick={() => handleHourSelect(hour)}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg transition-all
                ${
                  selectedHour === hour
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2"
                    : isPositive
                      ? "bg-green-50 hover:bg-green-100 border border-green-200"
                      : isNegative
                        ? "bg-red-50 hover:bg-red-100 border border-red-200"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                }
              `}
            >
              <div className="text-lg font-bold">{hour}</div>
              <div className="text-xs">시</div>

              {/* 변화량 표시 */}
              <div
                className={`
                absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold
                ${
                  isPositive
                    ? "bg-green-500 text-white"
                    : isNegative
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-700"
                }
              `}
              >
                {isPositive ? "↑" : isNegative ? "↓" : "-"}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 text-sm text-gray-500 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        <span>시간을 선택하여 상세 정보를 확인하세요</span>
      </div>
    </div>
  )
}

