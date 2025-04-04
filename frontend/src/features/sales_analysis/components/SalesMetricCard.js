import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function SalesMetricCard({ title, previousValue, currentValue, percentChange, type = "currency" }) {
  const formatValue = (value) => {
    if (type === "currency") {
      return Number(value).toLocaleString() + "원"
    } else if (type === "quantity") {
      return Number(value).toLocaleString() + "개"
    }
    return value
  }

  const difference = currentValue - previousValue
  const isPositive = difference > 0
  const isNegative = difference < 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>

      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold">{formatValue(currentValue)}</div>

        <div
          className={`flex items-center text-sm font-medium ${
            isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : isNegative ? (
            <TrendingDown className="w-4 h-4 mr-1" />
          ) : (
            <Minus className="w-4 h-4 mr-1" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {percentChange}%
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">이전: {formatValue(previousValue)}</div>
    </div>
  )
}

