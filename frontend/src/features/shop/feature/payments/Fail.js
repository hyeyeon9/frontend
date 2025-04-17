import { useSearchParams } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";

export function FailPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");
  const handleClose = () => {
    // Close the window if it's a popup
    window.close();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-red-50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-full p-3 shadow-sm">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            결제에 실패했습니다
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">에러 코드</p>
              <p className="font-medium text-gray-800">
                {errorCode || "알 수 없음"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">실패 사유</p>
              <p className="font-medium text-gray-800">
                {errorMessage || "알 수 없음"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
