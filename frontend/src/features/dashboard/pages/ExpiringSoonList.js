import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExpiringItems } from "../../inventory/api/HttpInventoryService";
import { ChevronRight } from "lucide-react";

export default function ExpiringSoonList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function getExpiringItems() {
      try {
        const data = await fetchExpiringItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch expiring items:", error);
      }
    }
    getExpiringItems();
  }, []);

  // Calculate days until expiration
  const getDaysUntil = (dateString) => {
    const today = new Date();
    const expirationDate = new Date(dateString);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date to Korean format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // Get product icon based on name (simplified example)
  const getProductIcon = (name) => {
    if (name.includes("우유") || name.includes("milk")) {
      return "🥛";
    } else if (name.includes("샌드위치") || name.includes("sandwich")) {
      return "🥪";
    } else if (name.includes("과일") || name.includes("fruit")) {
      return "🍎";
    } else {
      return "📦";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-blue-800 text-center">
          유통기한 임박
        </h2>
      </div>
      <div className="p-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            임박한 상품이 없습니다.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.slice(0, 3).map((item) => {
              const daysLeft = getDaysUntil(item.expirationDate);
              const icon = getProductIcon(item.goodsName.toLowerCase());

              return (
                <div
                  key={item.batchId}
                  className="flex items-center py-3 px-3 hover:bg-gray-50"
                >
                  <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                    <span className="text-xl">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm md:text-base truncate">
                      {item.goodsName}
                    </div>
                    <div className="text-xs md:text-sm text-red-500">
                      {formatDate(item.expirationDate)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">
                      재고: {item.stockQuantity}개
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div className="bg-gray-50 p-3 border-t border-gray-200 text-center">
          <Link
            to="/expiring-items"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            모든 유통기한 임박 상품 보기
          </Link>
        </div>
      )}
    </div>
  );
}
