import { useRef } from "react";
import { TrendingUp, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, Badge, Button } from "flowbite-react";

export default function PopularProductsList({ products, onAddToCart }) {
  const productsRef = useRef(null);

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

  return (
    <section className="max-w-7xl mx-auto px-4 mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold">이번 달 인기 상품</h2>
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
            key={product.id}
            className="flex-shrink-0 w-[180px] sm:w-[220px]"
          >
            <Card className="h-full">
              <div className="relative">
                <img
                  src={
                    `https://wvmmoqvaxudiftvldxts.supabase.co/storage/v1/object/public/kdt-final-images/goods_images/${product.image}` ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  className="object-cover w-full h-40 rounded-t-lg"
                />
                <Badge color="info" className="absolute top-2 right-2">
                  {product.category}
                </Badge>
              </div>
              <div className="p-3">
                <div className="mb-2">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold">
                      ₩{product.price.toLocaleString()}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" />
                      <span className="text-xs">{product.rating}</span>
                    </div>
                  </div>
                </div>
                <Button
                  color="blue"
                  className="w-full"
                  size="xs"
                  onClick={() => onAddToCart(product.id)}
                >
                  장바구니 담기
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
