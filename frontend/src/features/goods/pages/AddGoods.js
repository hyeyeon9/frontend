import { useState } from "react";
import { fetchFileUpload } from "../api/HttpGoodsService";
import {
  AlertCircle,
  Check,
  Image,
  Info,
  Package,
  Upload,
  X,
} from "lucide-react";

const categories = [
  { id: 1, first_name: "식품", second_name: "즉석식품" },
  { id: 2, first_name: "식품", second_name: "라면 & 면류" },
  { id: 3, first_name: "식품", second_name: "베이커리 & 샌드위치" },
  { id: 4, first_name: "식품", second_name: "냉장 & 냉동식품" },
  { id: 5, first_name: "식품", second_name: "과자 & 스낵" },
  { id: 6, first_name: "식품", second_name: "아이스크림 & 디저트" },
  { id: 7, first_name: "음료", second_name: "커피 & 차" },
  { id: 8, first_name: "음료", second_name: "탄산음료" },
  { id: 9, first_name: "음료", second_name: "주스 & 건강음료" },
  { id: 10, first_name: "음료", second_name: "유제품 & 두유" },
  { id: 11, first_name: "음료", second_name: "주류" },
  { id: 12, first_name: "생활용품", second_name: "위생용품" },
  { id: 13, first_name: "생활용품", second_name: "욕실용품" },
  { id: 14, first_name: "생활용품", second_name: "뷰티 & 화장품" },
  { id: 15, first_name: "생활용품", second_name: "의약 & 건강" },
  { id: 16, first_name: "디지털 & 문구", second_name: "전자기기 & 액세서리" },
  { id: 17, first_name: "디지털 & 문구", second_name: "문구류" },
];

const subCategories = [
  { sub_category_id: 1, category_id: 1, sub_category_name: "삼각김밥" },
  { sub_category_id: 2, category_id: 1, sub_category_name: "주먹밥" },
  { sub_category_id: 3, category_id: 1, sub_category_name: "컵밥" },
  { sub_category_id: 4, category_id: 1, sub_category_name: "도시락" },
  { sub_category_id: 5, category_id: 1, sub_category_name: "핫도그" },
  { sub_category_id: 6, category_id: 1, sub_category_name: "햄버거" },
  { sub_category_id: 7, category_id: 2, sub_category_name: "컵라면" },
  { sub_category_id: 8, category_id: 2, sub_category_name: "봉지라면" },
  { sub_category_id: 9, category_id: 2, sub_category_name: "우동" },
  { sub_category_id: 10, category_id: 2, sub_category_name: "쌀국수" },
  { sub_category_id: 11, category_id: 3, sub_category_name: "샌드위치" },
  { sub_category_id: 12, category_id: 3, sub_category_name: "크로와상" },
  { sub_category_id: 13, category_id: 3, sub_category_name: "도넛" },
  { sub_category_id: 14, category_id: 3, sub_category_name: "베이글" },
  { sub_category_id: 15, category_id: 4, sub_category_name: "냉동피자" },
  { sub_category_id: 16, category_id: 4, sub_category_name: "닭강정" },
  { sub_category_id: 17, category_id: 4, sub_category_name: "만두" },
  { sub_category_id: 18, category_id: 4, sub_category_name: "핫바" },
  { sub_category_id: 19, category_id: 4, sub_category_name: "튀김류" },
  { sub_category_id: 20, category_id: 5, sub_category_name: "감자칩" },
  { sub_category_id: 21, category_id: 5, sub_category_name: "팝콘" },
  { sub_category_id: 22, category_id: 5, sub_category_name: "비스킷" },
  { sub_category_id: 23, category_id: 5, sub_category_name: "견과류" },
  { sub_category_id: 24, category_id: 5, sub_category_name: "젤리" },
  { sub_category_id: 25, category_id: 5, sub_category_name: "초콜릿" },
  { sub_category_id: 26, category_id: 6, sub_category_name: "아이스크림" },
  { sub_category_id: 27, category_id: 6, sub_category_name: "젤라또" },
  { sub_category_id: 28, category_id: 6, sub_category_name: "요거트" },
  { sub_category_id: 29, category_id: 7, sub_category_name: "캔커피" },
  { sub_category_id: 30, category_id: 7, sub_category_name: "병커피" },
  { sub_category_id: 31, category_id: 7, sub_category_name: "티백" },
  { sub_category_id: 32, category_id: 7, sub_category_name: "스틱커피" },
  { sub_category_id: 33, category_id: 8, sub_category_name: "콜라" },
  { sub_category_id: 34, category_id: 8, sub_category_name: "사이다" },
  { sub_category_id: 35, category_id: 8, sub_category_name: "에너지드링크" },
  { sub_category_id: 36, category_id: 9, sub_category_name: "오렌지주스" },
  { sub_category_id: 37, category_id: 9, sub_category_name: "비타민음료" },
  { sub_category_id: 38, category_id: 10, sub_category_name: "우유" },
  { sub_category_id: 39, category_id: 10, sub_category_name: "두유" },
  { sub_category_id: 40, category_id: 10, sub_category_name: "요거트" },
  { sub_category_id: 41, category_id: 11, sub_category_name: "맥주" },
  { sub_category_id: 42, category_id: 11, sub_category_name: "소주" },
  { sub_category_id: 43, category_id: 11, sub_category_name: "와인" },
  { sub_category_id: 44, category_id: 11, sub_category_name: "칵테일음료" },
  { sub_category_id: 45, category_id: 12, sub_category_name: "휴지" },
  { sub_category_id: 46, category_id: 12, sub_category_name: "물티슈" },
  { sub_category_id: 47, category_id: 12, sub_category_name: "손소독제" },
  { sub_category_id: 48, category_id: 13, sub_category_name: "샴푸" },
  { sub_category_id: 49, category_id: 13, sub_category_name: "바디워시" },
  { sub_category_id: 50, category_id: 13, sub_category_name: "칫솔" },
  { sub_category_id: 51, category_id: 13, sub_category_name: "치약" },
  { sub_category_id: 52, category_id: 13, sub_category_name: "면도기" },
  { sub_category_id: 53, category_id: 14, sub_category_name: "립밤" },
  { sub_category_id: 54, category_id: 14, sub_category_name: "핸드크림" },
  { sub_category_id: 55, category_id: 14, sub_category_name: "스킨케어" },
  { sub_category_id: 56, category_id: 14, sub_category_name: "헤어왁스" },
  { sub_category_id: 57, category_id: 15, sub_category_name: "밴드" },
  { sub_category_id: 58, category_id: 15, sub_category_name: "진통제" },
  { sub_category_id: 59, category_id: 15, sub_category_name: "소독약" },
  { sub_category_id: 60, category_id: 15, sub_category_name: "영양제" },
  { sub_category_id: 61, category_id: 16, sub_category_name: "충전기" },
  { sub_category_id: 62, category_id: 16, sub_category_name: "보조배터리" },
  { sub_category_id: 63, category_id: 16, sub_category_name: "이어폰" },
  { sub_category_id: 64, category_id: 17, sub_category_name: "볼펜" },
  { sub_category_id: 65, category_id: 17, sub_category_name: "노트" },
  { sub_category_id: 66, category_id: 17, sub_category_name: "포스트잇" },
  { sub_category_id: 67, category_id: 17, sub_category_name: "테이프" },
  { sub_category_id: 68, category_id: 17, sub_category_name: "스티커" },
];

function AddGoods() {
  const [goodsId, setGoodsId] = useState("");
  const [goodsName, setGoodsName] = useState("");
  const [goodsPrice, setGoodsPrice] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [goodsStock, setGoodsStock] = useState("");
  const [goodsImage, setGoodsImage] = useState(null);
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedSecondName, setSelectedSecondName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const uniqueFirstNames = [...new Set(categories.map((c) => c.first_name))];
  const filteredSecondNames = categories.filter(
    (c) => c.first_name === selectedFirstName
  );

  // 이미지 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // 파일 처리 함수
  const handleFile = (file) => {
    if (file.type.startsWith("image/")) {
      setGoodsImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("이미지 파일만 업로드 가능합니다.");
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // 중분류 선택 시, category_id 설정
  const handleSecondNameChange = (e) => {
    const selectedName = e.target.value;
    setSelectedSecondName(selectedName);

    const matchedCategory = categories.find(
      (c) =>
        c.first_name === selectedFirstName && c.second_name === selectedName
    );
    setCategoryId(matchedCategory ? matchedCategory.id : "");
    setSubCategoryId(""); // 중분류가 변경되면 소분류 초기화
  };

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.category_id === Number(categoryId)
  );

  // 이미지 제거
  const removeImage = () => {
    setGoodsImage(null);
    setPreviewUrl(null);
  };

  // 폼 초기화
  const resetForm = () => {
    setGoodsName("");
    setGoodsPrice("");
    setGoodsDescription("");
    setGoodsStock("");
    setGoodsImage(null);
    setPreviewUrl(null);
    setSelectedFirstName("");
    setSelectedSecondName("");
    setCategoryId("");
    setSubCategoryId("");
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  // 상품 등록 요청
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("category_id", categoryId);
    formData.append("sub_category_id", subCategoryId);
    formData.append("goods_name", goodsName);
    formData.append("goods_price", goodsPrice);
    formData.append("goods_description", goodsDescription);
    formData.append("goods_stock", goodsStock);
    if (goodsImage) formData.append("goods_image", goodsImage);

    try {
      const response = await fetchFileUpload(formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || "상품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Package className="h-6 w-6 mr-2 text-indigo-600" />
            상품 등록
          </h1>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                상품이 성공적으로 등록되었습니다
              </h2>
              <p className="text-gray-600 mb-6">
                새로운 상품이 시스템에 추가되었습니다.
              </p>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                새 상품 등록하기
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6"
              encType="multipart/form-data"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽: 이미지 업로드 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Image className="h-5 w-5 mr-2 text-indigo-600" />
                    상품 이미지
                  </h2>

                  <div
                    className={`relative border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragActive
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="상품 이미지 미리보기"
                          className="w-full h-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-1">
                          이미지를 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-gray-500 text-sm">
                          JPG, PNG 파일 지원
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center text-blue-700 mb-2">
                      <Info className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">이미지 팁</h3>
                    </div>
                    <ul className="text-sm text-blue-600 space-y-1 list-disc pl-5">
                      <li>상품을 잘 보여주는 밝은 이미지를 사용하세요</li>
                      <li>배경이 깔끔한 이미지가 좋습니다</li>
                      <li>권장 크기: 800 x 800 픽셀 이상</li>
                    </ul>
                  </div>
                </div>

                {/* 오른쪽: 상품 정보 입력 */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-indigo-600" />
                    상품 정보
                  </h2>

                  {/* 상품명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={goodsName}
                      onChange={(e) => setGoodsName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="예: 따뜻한 삼각김밥"
                      required
                    />
                  </div>

                  {/* 카테고리 선택 */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* 대분류 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        대분류 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedFirstName}
                        onChange={(e) => {
                          setSelectedFirstName(e.target.value);
                          setSelectedSecondName("");
                          setCategoryId("");
                          setSubCategoryId("");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">선택하세요</option>
                        {uniqueFirstNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 중분류 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        중분류 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSecondName}
                        onChange={handleSecondNameChange}
                        disabled={!selectedFirstName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                        required
                      >
                        <option value="">선택하세요</option>
                        {filteredSecondNames.map((category) => (
                          <option
                            key={category.id}
                            value={category.second_name}
                          >
                            {category.second_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 소분류 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        소분류 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={subCategoryId}
                        onChange={(e) => setSubCategoryId(e.target.value)}
                        disabled={!categoryId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                        required
                      >
                        <option value="">선택하세요</option>
                        {filteredSubCategories.map((sub) => (
                          <option
                            key={sub.sub_category_id}
                            value={sub.sub_category_id}
                          >
                            {sub.sub_category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 가격 및 재고 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 가격 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        판매가격 (원) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={goodsPrice}
                          onChange={(e) => setGoodsPrice(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="예: 1200"
                          min="0"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">원</span>
                        </div>
                      </div>
                    </div>

                    {/* 재고 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        재고 수량 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={goodsStock}
                          onChange={(e) => setGoodsStock(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="예: 30"
                          min="0"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">개</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상품 설명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품 설명
                    </label>
                    <textarea
                      value={goodsDescription}
                      onChange={(e) => setGoodsDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="상품에 대한 간단한 설명을 입력하세요"
                      rows="4"
                    />
                  </div>

                  {/* 에러 메시지 */}
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-600">{submitError}</div>
                    </div>
                  )}

                  {/* 버튼 영역 */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      초기화
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-lg text-white flex items-center ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } transition-colors`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          등록 중...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          상품 등록
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddGoods;
