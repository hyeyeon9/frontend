"use client"

import Products from "../components/Products"
import { useState } from "react"
import { Search } from "lucide-react"
import { TextInput } from "flowbite-react"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="max-w-[430px] mx-auto pb-24 bg-gray-50 min-h-screen">
      {/* 검색창 - 상단 고정 */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <TextInput
            placeholder="상품 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        <Products isFullPage={true} searchQuery={searchQuery} />
      </div>
    </div>
  )
}

