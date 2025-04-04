import { useSearchParams } from "react-router-dom";

export function FailPage() {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-col items-center p-6 overflow-auto">
      <div className="max-w-[540px] w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">결제 실패</h2>
        <p className="text-lg text-gray-700">{`에러 코드: ${searchParams.get(
          "code"
        )}`}</p>
        <p className="text-lg text-gray-700">{`실패 사유: ${searchParams.get(
          "message"
        )}`}</p>
      </div>
    </div>
  );
}
