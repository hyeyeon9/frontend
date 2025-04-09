import Products from "../components/Products";
import { useState } from "react";
import { Search } from "lucide-react";
import { TextInput } from "flowbite-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container flex flex-col px-0 sm:px-6 min-h-screen">
      {/* 검색창 - 상단 고정 */}
      <div className="fixed top-14 right-0 z-[40] w-full h-[60px] bg-white border-b" />
      <div className="fixed top-14 right-0 z-[50] w-full sm:px-4 py-3">
        <div className="flex justify-end w-full">
          <div className="relative w-full md:w-1/3">
            <TextInput
              placeholder="상품 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              size="sm"
              className="px-2 sm:px-4"
            />
          </div>
        </div>
      </div>

      <div className="pt-14 px-0 sm:px-4">
        <Products isHomePage={false} searchQuery={searchQuery} />
      </div>
    </div>
  );
}
