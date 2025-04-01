import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, Badge, Button, TextInput, Pagination } from "flowbite-react";
import { fetchGetPagedGoods } from "../api/HttpShopService";
import categoryMapping from "../../../components/categoryMapping";

// 메인 카테고리 목록 추출
const mainCategories = [...new Set(categoryMapping.map((cat) => cat.main))];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  // 기본 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedMainCategory, setSelectedMainCategory] = useState("전체");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12; // 고정된 페이지 크기

  // 카테고리 파라미터가 변경될 때 선택된 카테고리 업데이트
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);

      // 메인 카테고리도 업데이트
      const category = categoryMapping.find(
        (cat) => cat.id.toString() === categoryParam
      );
      if (category) {
        setSelectedMainCategory(category.main);
      }
    }
  }, [categoryParam]);

  // 상품 목록 가져오기
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        // 페이지 번호는 0부터 시작 (서버 페이지네이션)
        const pageNumber = currentPage - 1;

        // API 호출 - 객체 형태로 파라미터 전달
        const response = await fetchGetPagedGoods({
          page: pageNumber,
          size: pageSize,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          sortBy: "popularity", // 기본 정렬 방식
        });

        // 응답 데이터 처리
        if (response) {
          setProducts(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        } else {
          setProducts([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } catch (error) {
        console.error("상품 목록을 불러오는 중 오류 발생:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [currentPage, selectedCategory, searchQuery]);

  // 필터링이나 검색어가 변경될 때 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // 메인 카테고리 선택 핸들러
  const handleMainCategorySelect = (mainCategory) => {
    if (mainCategory === "전체") {
      setSelectedMainCategory("전체");
      setSelectedCategory("");
    } else {
      setSelectedMainCategory(mainCategory);
      // 메인 카테고리가 변경되면 서브 카테고리는 초기화하지만 API 요청은 하지 않음
    }
  };

  // 서브 카테고리 선택 핸들러
  const handleSubCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId.toString());
  };

  // 페이지 변경 핸들러
  const onPageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 상품 상세 페이지로 이동
  const goToProductDetail = (productId) => {
    navigate(`/shop/products/${productId}`);
  };

  // 장바구니에 상품 추가
  const addToCart = (e, productId) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    console.log(`상품 ID ${productId}를 장바구니에 추가했습니다.`);
  };

  // 할인율 표시 여부 확인
  const isDiscounted = (product) => {
    return (
      product.discountRate > 0 && new Date(product.discountEndAt) > new Date()
    );
  };

  // 현재 선택된 카테고리의 이름 가져오기
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "모든 상품";

    const category = categoryMapping.find(
      (cat) => cat.id.toString() === selectedCategory
    );
    return category ? `${category.main} > ${category.sub}` : "상품";
  };

  // 현재 메인 카테고리에 해당하는 서브 카테고리 필터링
  const filteredSubCategories =
    selectedMainCategory === "전체"
      ? []
      : categoryMapping.filter((cat) => cat.main === selectedMainCategory);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{getSelectedCategoryName()}</h1>

        {/* 검색 영역 */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <TextInput
            placeholder="상품 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          color={selectedMainCategory === "전체" ? "blue" : "light"}
          size="md"
          onClick={() => handleMainCategorySelect("전체")}
        >
          전체
        </Button>
        {mainCategories.map((mainCategory) => (
          <Button
            key={mainCategory}
            color={selectedMainCategory === mainCategory ? "blue" : "light"}
            size="md"
            onClick={() => handleMainCategorySelect(mainCategory)}
          >
            {mainCategory}
          </Button>
        ))}
      </div>

      {/* 서브 카테고리 버튼 */}
      {selectedMainCategory !== "전체" && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filteredSubCategories.map((category) => (
            <Button
              key={category.id}
              color={
                selectedCategory === category.id.toString() ? "blue" : "light"
              }
              size="sm"
              onClick={() => handleSubCategorySelect(category.id)}
            >
              {category.sub}
            </Button>
          ))}
        </div>
      )}

      {/* 상품 그리드 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.goods_id}
                className={`max-w-sm cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={
                      `${product.goods_image}` ||
                      "/placeholder.svg?height=200&width=200"
                    }
                    alt={product.goods_name}
                    className="object-cover w-full h-60 rounded-t-lg"
                  />

                  {/* 품절 오버레이 */}
                  {product.goods_stock <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold px-2 py-1 rounded-md bg-red-500">
                        품절
                      </span>
                    </div>
                  )}

                  {/* 할인율 배지 */}
                  {isDiscounted(product) && (
                    <Badge color="failure" className="absolute top-2 right-2">
                      {product.discountRate}% 할인
                    </Badge>
                  )}

                  {/* 카테고리 배지 */}
                  <Badge color="info" className="absolute top-2 left-2">
                    {(() => {
                      const category = categoryMapping.find(
                        (cat) => cat.id === product.category_id
                      );
                      return category
                        ? category.sub
                        : `카테고리 ${product.category_id}`;
                    })()}
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium line-clamp-1">
                      {product.goods_name}
                    </h3>
                    <div className="text-right">
                      {isDiscounted(product) && (
                        <span className="text-gray-500 line-through text-xs block">
                          ₩{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span
                        className={`font-bold ${
                          isDiscounted(product) ? "text-red-600" : ""
                        }`}
                      >
                        ₩{product.goods_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    color="blue"
                    className="w-full"
                    size="sm"
                    onClick={(e) => addToCart(e, product.goods_id)}
                    disabled={product.goods_stock <= 0}
                  >
                    {product.goods_stock > 0 ? "장바구니 담기" : "품절"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* 페이지네이션 컨트롤 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">상품을 찾을 수 없습니다</h3>
          <p className="text-gray-500">검색어나 필터 조건을 변경해보세요</p>
        </div>
      )}
    </div>
  );
}
