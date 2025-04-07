import { Blend } from "lucide-react";

export default function AdminToShop() {
  return (
    <div className="fixed bottom-4 left-4 z-[150]">
      {/* 플로팅 버튼 */}
      <button
        onClick={() => (window.location.href = "/shop")}
        className="h-14 w-14 rounded-full shadow-lg bg-gray-500 hover:bg-blue-500 text-white flex items-center justify-center"
      >
        <Blend className="h-6 w-6" />
      </button>
    </div>
  );
}
