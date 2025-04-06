"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowUpDown, Filter, Search, RefreshCw } from "lucide-react";
import {
  Card,
  Badge,
  Button,
  TextInput,
  Pagination,
  Dropdown,
} from "flowbite-react";
import { fetchGetPagedGoods } from "../api/HttpShopService";
import categoryMapping from "../../../components/categoryMapping";
import { addItemToCart, getCartItemCount } from "../utils/CartUtils";
import { fetchGoodsDetail } from "../../goods/api/HttpGoodsService";

// 메인 카테고리 목록 추출
const mainCategories = [...new Set(categoryMapping.map((cat) => cat.main))];

export default function Products({ onAddToCart, isHomePage, isFullPage }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  // 기본 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedMainCategory, setSelectedMainCategory] = useState("전체");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // 필터링 상태
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12; // 고정된 페이지 크기

  // 장바구니 아이템 수 상태 추가
  const [cartCountState, setCartCountState] = useState(getCartItemCount());

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
          minPrice: priceRange.min || undefined,
          maxPrice: priceRange.max || undefined,
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
    priceRange,
    inStockOnly,
    pageSize,
  ]);

  // 필터링이나 검색어가 변경될 때 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, priceRange, inStockOnly]);

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
      if (onAddToCart) {
        onAddToCart(productId, 1);
      }

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

  // 가격 범위 입력 핸들러
  const handlePriceRangeChange = (type, value) => {
    // 숫자만 입력 가능하도록
    const numericValue = value.replace(/[^0-9]/g, "");
    setPriceRange((prev) => ({
      ...prev,
      [type]: numericValue,
    }));
  };

  // 필터 초기화 핸들러
  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("");
    setPriceRange({ min: "", max: "" });
    setInStockOnly(false);
    setSelectedCategory("");
    setSelectedMainCategory("전체");
    setCurrentPage(1);
  };

  // 홈페이지에서는 간소화된 UI 표시
  if (isHomePage) {
    return (
      <div>
        {/* 카테고리 버튼 */}
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

        {/* 상품 그리드 - 홈페이지용 간소화 버전 */}
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card
                key={product.goods_id}
                className={`cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={product.goods_image}
                    alt={product.goods_name}
                    className="object-cover w-full h-40 rounded-t-lg"
                  />
                  {isDiscounted(product) && (
                    <Badge color="failure" className="absolute top-2 right-2">
                      {product.discountRate}% 할인
                    </Badge>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 truncate">
                    {product.goods_name}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">
                      ₩{product.goods_price.toLocaleString()}
                    </span>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">상품을 찾을 수 없습니다</p>
          </div>
        )}

        {/* 더 보기 버튼 */}
        <div className="flex justify-center mt-6">
          <Button
            color="light"
            onClick={() => navigate("/shop/products")}
            className="w-full md:w-auto"
          >
            모든 상품 보기
          </Button>
        </div>
      </div>
    );
  }

  // 전체 페이지 버전
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{getSelectedCategoryName()}</h1>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          {/* 검색 영역 */}
          <div className="relative w-full sm:w-64">
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

          {/* 필터 버튼 */}
          <div className="flex gap-2">
            <Button color="light" size="sm" className="flex items-center">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortBy === "popularity" && "인기순"}
              {sortBy === "price-low" && "가격 낮은순"}
              {sortBy === "price-high" && "가격 높은순"}
              {sortBy === "name" && "이름순"}
              {!sortBy && "정렬"}
            </Button>

            <Dropdown
              label={
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </div>
              }
              dismissOnClick={false}
              color="light"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Dropdown.Header>
                <span className="block text-sm font-medium">정렬 기준</span>
              </Dropdown.Header>
              <Dropdown.Item
                onClick={() => setSortBy("")}
                className={sortBy === "" ? "bg-gray-100" : ""}
              >
                기본
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setSortBy("popularity")}
                className={sortBy === "popularity" ? "bg-gray-100" : ""}
              >
                인기순
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setSortBy("price-low")}
                className={sortBy === "price-low" ? "bg-gray-100" : ""}
              >
                가격 낮은순
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setSortBy("price-high")}
                className={sortBy === "price-high" ? "bg-gray-100" : ""}
              >
                가격 높은순
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setSortBy("name")}
                className={sortBy === "name" ? "bg-gray-100" : ""}
              >
                이름순
              </Dropdown.Item>

              <Dropdown.Divider />

              <div className="px-4 py-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                    className="mr-2"
                  />
                  <span className="text-sm">재고 있는 상품만 보기</span>
                </label>
              </div>

              <Dropdown.Divider />

              {/* 필터 초기화 버튼 */}
              <div className="px-4 py-2">
                <Button
                  color="light"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  필터 초기화
                </Button>
              </div>
            </Dropdown>
          </div>
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
                    src={product.goods_image}
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
                  <div className="flex flex-col mb-3">
                    <h3 className="font-medium text-sm mb-2 min-h-[40px]">
                      {product.goods_name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div
                        className={`h-4 ${
                          !isDiscounted(product) ? "invisible text-xs" : ""
                        }`}
                      >
                        {isDiscounted(product) ? (
                          <span className="text-gray-500 line-through text-xs">
                            ₩{product.originalPrice.toLocaleString()}
                          </span>
                        ) : (
                          "₩0"
                        )}
                      </div>
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
                    onClick={(e) => handleAddToCart(e, product.goods_id)}
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
          <Button color="light" onClick={resetFilters} className="mt-4">
            필터 초기화
          </Button>
        </div>
      )}

      {/* 하단 장바구니 위젯 - 전체 화면 모드일 때만 표시 */}
      {isFullPage && (
        <div className="sticky bottom-0 bg-white border-t p-4 z-10">
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
      )}
    </div>
  );
}
