import { Blend } from "lucide-react";

export default function ShopToAdmin() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* 플로팅 버튼 */}
      <button
        onClick={() => (window.location.href = "/")}
        className="h-14 w-14 rounded-full shadow-lg bg-gray-500 hover:bg-blue-500 text-white flex items-center justify-center"
      >
        <Blend className="h-6 w-6" />
      </button>
    </div>
  );
}
