import { Button } from "flowbite-react";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscountedProductsList from "../components/DiscountedProductList";
import EventBanner from "../components/EventBanner";
import PopularProductsList from "../components/PopularProductsList";

export default function ShopHome() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Discounted products
  const discountedProducts = [
    {
      id: 1,
      name: "아이스 아메리카노",
      originalPrice: 3.5,
      price: 2.5,
      discount: "29%",
      category: "Coffee",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "치킨 샌드위치",
      originalPrice: 6.99,
      price: 4.99,
      discount: "29%",
      category: "Food",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 3,
      name: "에너지 드링크",
      originalPrice: 4.29,
      price: 3.29,
      discount: "23%",
      category: "Drinks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 4,
      name: "초콜릿 바",
      originalPrice: 2.49,
      price: 1.99,
      discount: "20%",
      category: "Snacks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 5,
      name: "감자칩",
      originalPrice: 3.49,
      price: 2.49,
      discount: "29%",
      category: "Snacks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 6,
      name: "그릭 요거트",
      originalPrice: 4.99,
      price: 3.99,
      discount: "20%",
      category: "Dairy",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 7,
      name: "아이스티",
      originalPrice: 3.99,
      price: 2.99,
      discount: "25%",
      category: "Drinks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 8,
      name: "바나나 우유",
      originalPrice: 2.99,
      price: 1.99,
      discount: "33%",
      category: "Dairy",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 9,
      name: "프로틴 바",
      originalPrice: 3.99,
      price: 2.99,
      discount: "25%",
      category: "Snacks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 10,
      name: "카페 라떼",
      originalPrice: 4.99,
      price: 3.99,
      discount: "20%",
      category: "Coffee",
      image: "/placeholder.svg?height=200&width=200",
    },
  ];

  // Popular products
  const popularProducts = [
    {
      id: 1,
      name: "아이스 아메리카노",
      price: 2.5,
      rating: 4.8,
      sales: 1240,
      category: "Coffee",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 8,
      name: "카페 라떼",
      price: 3.99,
      rating: 4.7,
      sales: 980,
      category: "Coffee",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 3,
      name: "에너지 드링크",
      price: 3.29,
      rating: 4.5,
      sales: 850,
      category: "Drinks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 11,
      name: "핫도그",
      price: 3.49,
      rating: 4.6,
      sales: 790,
      category: "Food",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "치킨 샌드위치",
      price: 4.99,
      rating: 4.7,
      sales: 720,
      category: "Food",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 12,
      name: "아이스크림",
      price: 2.99,
      rating: 4.9,
      sales: 680,
      category: "Ice Cream",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 4,
      name: "초콜릿 바",
      price: 1.99,
      rating: 4.4,
      sales: 650,
      category: "Snacks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 7,
      name: "생수",
      price: 1.49,
      rating: 4.3,
      sales: 620,
      category: "Drinks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 5,
      name: "감자칩",
      price: 2.49,
      rating: 4.5,
      sales: 580,
      category: "Snacks",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 9,
      name: "탄산음료",
      price: 1.99,
      rating: 4.4,
      sales: 540,
      category: "Drinks",
      image: "/placeholder.svg?height=200&width=200",
    },
  ];

  // 장바구니 추가
  const addToCart = (productId) => {
    console.log(`Added product ${productId} to cart`);
    setCartCount(cartCount + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        {/* Event Banner Carousel - Now with fixed banners */}
        <EventBanner />

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="찾으시는 상품을 검색해보세요..."
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Discounted Products Section */}
        <DiscountedProductsList
          products={discountedProducts}
          onAddToCart={addToCart}
        />

        {/* Popular Products Section */}
        <PopularProductsList
          products={popularProducts}
          onAddToCart={addToCart}
        />

        {/* Shop by Category Section - Simplified */}
        <section className="max-w-7xl mx-auto px-4 mb-10">
          <h2 className="text-xl font-bold mb-4">카테고리별 쇼핑</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Coffee", "Food", "Drinks", "Snacks"].map((category) => (
              <Button
                key={category}
                color="light"
                className="h-auto py-4"
                onClick={() => navigate(`/shop/products?category=${category}`)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-between max-w-7xl mx-auto">
          <Button
            color="blue"
            size="lg"
            className="w-full"
            onClick={() => navigate("/shop/cart")}
          >
            장바구니 보기 {cartCount > 0 && `(${cartCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
