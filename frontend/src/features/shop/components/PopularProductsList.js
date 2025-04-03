import { useEffect, useRef, useState } from "react";
import { TrendingUp, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, Badge, Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import categoryMapping from "../../../components/categoryMapping";
import { fetchGetTop10Items } from "../api/HttpShopService";

export default function PopularProductsList({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const productsRef = useRef(null);

  // 인기 상품 불러오기
  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoading(true);
      try {
        const response = await fetchGetTop10Items();
        setProducts(response);
      } catch (error) {
        console.error("인기 상품을 불러오는 중 오류 발생: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularProducts();
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
          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold">이번 주 인기 상품</h2>
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

      <div
        ref={productsRef}
        className="flex overflow-x-auto pb-4 hide-scrollbar gap-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.goodsDTO.goods_id}
            className="flex-shrink-0 w-[180px] sm:w-[220px]"
          >
            <Card
              className={`h-full cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                product.goodsDTO.goods_stock <= 0 ? "opacity-70" : ""
              }`}
              onClick={() => goToProductDetail(product.goodsDTO.goods_id)}
            >
              <div className="relative">
                <img
                  src={product.goodsDTO.goods_image || "/placeholder.svg"}
                  alt={product.goodsDTO.goods_name}
                  className="object-cover w-full h-40 rounded-t-lg"
                />
                {/* 카테고리 배지 */}
                <Badge color="info" className="absolute top-2 left-2">
                  {(() => {
                    const category = categoryMapping.find(
                      (cat) => cat.id === product.goodsDTO.category_id
                    );
                    return category
                      ? category.sub
                      : `카테고리 ${product.goodsDTO.category_id}`;
                  })()}
                </Badge>
              </div>
              <div className="p-3">
                <div className="mb-2">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {product.goodsDTO.goods_name}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold">
                      ₩{product.goodsDTO.goods_price.toLocaleString()}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" />
                      <span className="text-xs">
                        {product.goodsDTO.goods_orders}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  color="blue"
                  className="w-full"
                  size="xs"
                  onClick={(e) => handleAddToCart(e, product.goodsDTO.goods_id)}
                  disabled={product.goodsDTO.goods_stock <= 0}
                >
                  {product.goodsDTO.goods_stock > 0 ? "장바구니 담기" : "품절"}
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>

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
