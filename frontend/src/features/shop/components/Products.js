import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowUpDown, Filter, Plus, ShoppingBag } from "lucide-react";
import { Badge, Button, Pagination, Dropdown } from "flowbite-react";
import { fetchGetPagedGoods } from "../api/HttpShopService";
import categoryMapping from "../../../components/categoryMapping";
import { addItemToCart, getCartItemCount } from "../utils/CartUtils";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";

// 메인 카테고리 목록 추출
const mainCategories = [...new Set(categoryMapping.map((cat) => cat.main))];
// console.log("카테고리",mainCategories) //  ['식품', '음료', '생활용품', '디지털 & 문구']
export default function Products({
  onAddToCart,
  isHomePage,
  isFullPage,
  searchQuery,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  // 기본 상태
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedMainCategory, setSelectedMainCategory] = useState("전체");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // 필터링 상태
  const [sortBy, setSortBy] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8; // 모바일에 맞게 페이지 크기 조정

  // 장바구니 알림 상태
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // 컴포넌트 마운트 시 장바구니 개수 로드
  useEffect(() => {
    setCartCount(getCartItemCount());

    // 세션 스토리지 변경 이벤트 리스너 추가
    const handleStorageChange = () => {
      setCartCount(getCartItemCount());
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener("storage-cart-updated", handleStorageChange);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("storage-cart-updated", handleStorageChange);
    };
  }, []);

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
          sortBy: sortBy, // 정렬 방식
        });

        // 응답 데이터 처리
        if (response) {
          let filteredProducts = response.content || [];

          // 재고 있는 상품만 필터링 (클라이언트 사이드 필터링)
          if (inStockOnly) {
            filteredProducts = filteredProducts.filter(
              (product) => product.goods_stock > 0
            );
          }

          setProducts(filteredProducts);
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
  }, [
    currentPage,
    selectedCategory,
    searchQuery,
    sortBy,
    inStockOnly,
    pageSize,
  ]);

  // 필터링이나 검색어가 변경될 때 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, inStockOnly]);

  // 메인 카테고리 선택 핸들러
  const handleMainCategorySelect = (mainCategory) => {
    if (mainCategory === "전체") {
      setSelectedMainCategory("전체");
      setSelectedCategory("");
    } else {
      setSelectedMainCategory(mainCategory);

      const subCategories = categoryMapping.filter(
        (cat) => cat.main === mainCategory
      );
      if (subCategories.length > 0) {
        // ✅ 첫 번째 소분류 ID를 category로 설정해야 API 필터링이 제대로 작동함
        setSelectedCategory(subCategories[0].id.toString());
      }
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

  // 장바구니에 상품 추가 - 이벤트 객체 사용하지 않고 직접 productId 전달
  const handleAddToCart = async (event, productId) => {
    if (event) {
      event.stopPropagation(); // 이벤트 객체가 있을 경우에만 stopPropagation 호출
    }

    try {
      // 상품 상세 정보 가져오기
      const productDetail = await fetchGoodsDetail(productId);

      // 장바구니에 추가
      addItemToCart(productDetail, 1);

      // 장바구니 개수 업데이트
      setCartCount(getCartItemCount());

      // 부모 컴포넌트의 onAddToCart가 있으면 호출
      // if (onAddToCart) {
      //   onAddToCart(productId, 1)
      // }

      // 알림 표시
      setAddedProduct(productDetail);
      setShowCartAlert(true);

      // 2초 후 알림 숨기기
      setTimeout(() => {
        setShowCartAlert(false);
      }, 2000);

      console.log(`Added product ${productId} to cart`);
    } catch (error) {
      console.error("장바구니에 상품을 추가하는 중 오류 발생:", error);
    }
  };

  // 할인율 표시 여부 확인
  const isDiscounted = (product) => {
    return (
      product.discountRate > 0 && new Date(product.discountEndAt) > new Date()
    );
  };

  // 현재 메인 카테고리에 해당하는 서브 카테고리 필터링
  const filteredSubCategories =
    selectedMainCategory === "전체"
      ? []
      : categoryMapping.filter((cat) => cat.main === selectedMainCategory);

  // 필터 초기화 핸들러
  const resetFilters = () => {
    setSortBy("");
    setInStockOnly(false);
    setSelectedCategory("");
    setSelectedMainCategory("전체");
    setCurrentPage(1);
  };

  // 홈페이지에서는 간소화된 UI 표시
  if (isHomePage) {
    return (
      <div>
        {/* 장바구니 추가 알림 */}
        {showCartAlert && addedProduct && (
          <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg text-center">
              <p className="text-sm font-medium">장바구니에 상품을 담았어요</p>
            </div>
          </div>
        )}

        {/* 카테고리 버튼 - 스크롤 가능한 컨테이너로 변경 */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-4 pb-1">
          <Button
            color={selectedMainCategory === "전체" ? "blue" : "light"}
            size="xs"
            onClick={() => handleMainCategorySelect("전체")}
            className="whitespace-nowrap"
          >
            전체
          </Button>
          {mainCategories.map((mainCategory) => (
            <Button
              key={mainCategory}
              color={selectedMainCategory === mainCategory ? "blue" : "light"}
              size="xs"
              onClick={() => handleMainCategorySelect(mainCategory)}
              className="whitespace-nowrap"
            >
              {mainCategory}
            </Button>
          ))}
        </div>

        {/* 서브 카테고리 버튼 - 스크롤 가능한 컨테이너로 변경 */}
        {selectedMainCategory !== "전체" && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-4 pb-1">
            {filteredSubCategories.map((category) => (
              <Button
                key={category.id}
                color={
                  selectedCategory === category.id.toString() ? "blue" : "light"
                }
                size="xs"
                onClick={() => handleSubCategorySelect(category.id)}
                className="whitespace-nowrap"
              >
                {category.sub}
              </Button>
            ))}
          </div>
        )}

        {/* 상품 그리드 - 홈페이지용 간소화 버전 */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.slice(0, 4).map((product) => (
              <div
                key={product.goods_id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={product.goods_image || "/placeholder.svg"}
                    alt={product.goods_name}
                    className="object-cover w-full h-28 rounded-t-lg"
                  />
                  {isDiscounted(product) && (
                    <Badge
                      color="failure"
                      className="absolute top-1 right-1 text-xs px-1.5 py-0.5"
                    >
                      {product.discountRate}%
                    </Badge>
                  )}

                  {/* 장바구니 추가 버튼 */}
                  <button
                    onClick={(e) => handleAddToCart(e, product.goods_id)}
                    disabled={product.goods_stock <= 0}
                    className={`absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full shadow-md ${
                      product.goods_stock <= 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-xs line-clamp-1">
                    {product.goods_name}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-xs">
                      {product.goods_price.toLocaleString()}원
                    </span>
                  </div>
                  {/* 재고 정보 표시 */}
                  {product.goods_stock > 0 && product.goods_stock <= 5 && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {product.goods_stock}개 남았어요
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">상품을 찾을 수 없습니다</p>
          </div>
        )}

        {/* 더 보기 버튼 */}
        <div className="flex justify-center mt-4">
          <Button
            color="light"
            size="sm"
            onClick={() => navigate("/shop/products")}
            className="w-full"
          >
            모든 상품 보기
          </Button>
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
      </div>
    );
  }

  // 전체 페이지 버전
  return (
    <div className="max-w-[430px] mx-auto">
      {/* 장바구니 추가 알림 */}
      {showCartAlert && addedProduct && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg text-center">
            <p className="text-sm font-medium">장바구니에 상품을 담았어요</p>
          </div>
        </div>
      )}

      {/* 카테고리 탭 - 대분류 */}
      <div className="border-b mb-3">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleMainCategorySelect("전체")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              selectedMainCategory === "전체"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            전체
          </button>
          {mainCategories.map((mainCategory) => (
            <button
              key={mainCategory}
              onClick={() => handleMainCategorySelect(mainCategory)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedMainCategory === mainCategory
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {mainCategory}
            </button>
          ))}
        </div>
      </div>

      {/* 서브 카테고리 버튼 - 버블 형태 */}
      {selectedMainCategory !== "전체" && (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-4 pb-1">
          {filteredSubCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSubCategorySelect(category.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${
                selectedCategory === category.id.toString()
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.sub}
            </button>
          ))}
        </div>
      )}

      {/* 상품 개수 및 필터 옵션 */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-600">
          {totalElements > 0 ? `총 ${totalElements}개 상품` : "상품 없음"}
        </div>
        <div className="flex gap-2">
          <Dropdown
            label={
              <div className="flex items-center text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortBy === "popularity" && "인기순"}
                {sortBy === "price-low" && "낮은가격순"}
                {sortBy === "price-high" && "높은가격순"}
                {!sortBy && "기본정렬"}
              </div>
            }
            size="xs"
            color="light"
          >
            <Dropdown.Item onClick={() => setSortBy("")}>
              기본정렬
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy("popularity")}>
              인기순
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy("price-low")}>
              낮은가격순
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy("price-high")}>
              높은가격순
            </Dropdown.Item>
          </Dropdown>

          <Dropdown
            label={
              <div className="flex items-center text-xs">
                <Filter className="h-3 w-3 mr-1" />
                필터
              </div>
            }
            size="xs"
            color="light"
          >
            <Dropdown.Item>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="mr-2"
                />
                <span className="text-sm">재고 있는 상품만</span>
              </label>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={resetFilters}>
              <span className="text-sm">필터 초기화</span>
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <div
                key={product.goods_id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={product.goods_image || "/placeholder.svg"}
                    alt={product.goods_name}
                    className="object-cover w-full h-32 rounded-t-lg"
                  />

                  {/* 품절 오버레이 */}
                  {product.goods_stock <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold px-2 py-1 rounded-md bg-red-500 text-xs">
                        품절
                      </span>
                    </div>
                  )}

                  {/* 할인율 배지 */}
                  {isDiscounted(product) && (
                    <Badge
                      color="failure"
                      className="absolute top-1 right-1 text-xs px-1.5 py-0.5"
                    >
                      {product.discountRate}%
                    </Badge>
                  )}

                  {/* 카테고리 배지 */}
                  {/* <Badge color="info" className="absolute top-1 left-1 text-xs px-1.5 py-0.5">
                    {(() => {
                      const category = categoryMapping.find((cat) => cat.id === product.category_id)
                      return category ? category.sub : `카테고리 ${product.category_id}`
                    })()}
                  </Badge> */}

                  {/* 장바구니 추가 버튼 */}
                  <button
                    onClick={(e) => handleAddToCart(e, product.goods_id)}
                    disabled={product.goods_stock <= 0}
                    className={`absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full shadow-md ${
                      product.goods_stock <= 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-xs mb-1 line-clamp-2 min-h-[32px]">
                      {product.goods_name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div
                        className={`h-4 ${
                          !isDiscounted(product) ? "invisible text-xs" : ""
                        }`}
                      >
                        {isDiscounted(product) ? (
                          <span className="text-gray-500 line-through text-[10px]">
                            {product.originalPrice.toLocaleString()}원
                          </span>
                        ) : (
                          "₩0"
                        )}
                      </div>
                      <span
                        className={`font-bold text-xs ${
                          isDiscounted(product) ? "text-red-600" : ""
                        }`}
                      >
                        {product.goods_price.toLocaleString()}원
                      </span>
                    </div>

                    {/* 재고 정보 표시 */}
                    {product.goods_stock > 0 && product.goods_stock <= 5 && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {product.goods_stock}개 남았어요
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 컨트롤 */}
          {totalPages > 1 && (
            <div className="flex justify-center mb-16">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
                layout="navigation"
                size="sm"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-base font-medium">상품을 찾을 수 없습니다</h3>
          <p className="text-gray-500 text-sm mt-1">
            검색어나 필터 조건을 변경해보세요
          </p>
          <Button
            color="light"
            size="sm"
            onClick={resetFilters}
            className="mt-3"
          >
            필터 초기화
          </Button>
        </div>
      )}

      {/* 하단 장바구니 위젯 - 전체 화면 모드일 때만 표시 */}
      {isFullPage && (
        <div className="fixed bottom-0 bg-white border-t p-3 z-10 max-w-[430px] w-full">
          <Button
            color="blue"
            size="lg"
            className="w-full py-2.5 text-base"
            onClick={() => navigate("/shop/cart")}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            장바구니 보기 {cartCount > 0 && `(${cartCount})`}
          </Button>
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
    </div>
  );
}
