import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, Badge, Button } from "flowbite-react";
import { fetchGetDiscountedGoods } from "../api/HttpShopService";

export default function DiscountedProductsList({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const productsRef = useRef(null);

  useEffect(() => {
    const fetchDiscountedGoods = async () => {
      setLoading(true);
      try {
        const response = await fetchGetDiscountedGoods();
        setProducts(response);
      } catch (error) {
        console.error("할인 상품을 불러오는 중 오류 발생: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountedGoods();
  }, []);

  const scroll = (direction) => {
    if (productsRef.current) {
      const { current } = productsRef;
      const scrollAmount =
        direction === "left"
          ? -current.offsetWidth / 2
          : current.offsetWidth / 2;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // 이벤트 객체 사용하지 않고 직접 productId 전달
  const handleAddToCart = (event, productId) => {
    if (event) {
      event.stopPropagation(); // 이벤트 객체가 있을 경우에만 stopPropagation 호출
    }
    onAddToCart(productId);
  };

  const goToProductDetail = (productId) => {
    navigate(`/shop/products/${productId}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Tag className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-bold">할인 중인 상품</h2>
        </div>
        <div className="flex gap-2">
          <Button
            color="light"
            size="sm"
            onClick={() => scroll("left")}
            className="rounded-full p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={() => scroll("right")}
            className="rounded-full p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length > 0 ? (
        <div
          ref={productsRef}
          className="flex overflow-x-auto pb-4 hide-scrollbar gap-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.goods_id}
              className="flex-shrink-0 w-[180px] sm:w-[220px]"
            >
              <Card
                className={`h-full cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={
                      product.goods_image ||
                      "/placeholder.svg?height=200&width=200" ||
                      "/placeholder.svg"
                    }
                    alt={product.goods_name}
                    className="object-cover w-full h-40 rounded-t-lg"
                  />
                  {product.goods_stock <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold px-2 py-1 rounded-md bg-red-500">
                        품절
                      </span>
                    </div>
                  )}
                  <Badge color="failure" className="absolute top-2 right-2">
                    {product.discountRate}%
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">
                      {product.goods_name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-500 line-through text-xs mr-2">
                        ₩{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="font-bold text-red-600">
                        ₩{product.goods_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    color="blue"
                    className="w-full"
                    size="xs"
                    onClick={(e) => handleAddToCart(e, product.goods_id)}
                    disabled={product.goods_stock <= 0}
                  >
                    {product.goods_stock > 0 ? "장바구니 담기" : "품절"}
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">현재 할인 중인 상품이 없습니다.</p>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
