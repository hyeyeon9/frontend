import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDisposalByDate } from "../api/HttpDisposalService";
import { Trash2, ChevronRight } from "lucide-react";

export default function DisposalToday() {
  const [disposal, setDisposal] = useState([]);

  useEffect(() => {
    async function getDisposalByDate() {
      try {
        const today = getToday();
        const data = await fetchDisposalByDate(today);
        setDisposal(data);
      } catch (error) {
        console.error("Failed to fetch disposal items:", error);
      }
    }
    getDisposalByDate();
  }, []);

  // Get today's date in YYYY-MM-DD format
  function getToday() {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-blue-800 text-center">
          폐기 예정
        </h2>
      </div>
      <div className="p-2">
        {disposal.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            오늘은 폐기된 항목이 없습니다.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {disposal.slice(0, 3).map((item) => (
              <div
                key={item.disposal_id}
                className="flex items-center py-3 px-3 hover:bg-gray-50"
              >
                <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.goods_name}</div>
                  <div className="text-sm text-red-500">폐기 예정: 오늘</div>
                  <div className="text-sm text-gray-500">
                    재고: {item.disposed_quantity}개
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
      {disposal.length > 0 && (
        <div className="bg-gray-50 p-3 border-t border-gray-200 text-center">
          <Link
            to="/disposal"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            모든 폐기 예정 상품 보기
          </Link>
        </div>
      )}
    </div>
  );
}
