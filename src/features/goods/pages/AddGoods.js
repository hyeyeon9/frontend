import { useState, useMemo } from "react";
import { fetchFileUpload } from "../api/HttpService";


const categories = [
  { id: 1, first_name: "식품", second_name: "즉석식품" },
  { id: 2, first_name: "식품", second_name: "라면 & 면류" },
  { id: 3, first_name: "식품", second_name: "베이커리 & 샌드위치" },
  { id: 4, first_name: "식품", second_name: "냉장/냉동식품" },
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

  const uniqueFirstNames = [...new Set(categories.map((c) => c.first_name))];
  const filteredSecondNames = categories.filter((c) => c.first_name === selectedFirstName);



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
    { sub_category_id: 68, category_id: 17, sub_category_name: "스티커" }
];

  

  // 이미지 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGoodsImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 중분류 선택 시, category_id 설정
  const handleSecondNameChange = (e) => {
    const selectedName = e.target.value;
    setSelectedSecondName(selectedName);

    const matchedCategory = categories.find(
      (c) => c.first_name === selectedFirstName && c.second_name === selectedName
    );
    setCategoryId(matchedCategory ? matchedCategory.id : "");
   
  };

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.category_id === Number(categoryId) // 선택된 대분류(category_id)에 해당하는 중분류 필터링
  );
  

  // 상품 등록 요청
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_id", categoryId);  // ✅ category_id는 반드시 필요
    formData.append("sub_category_id", subCategoryId);
    formData.append("goods_name", goodsName);
    formData.append("goods_price", goodsPrice);
    formData.append("goods_description", goodsDescription);
    formData.append("goods_stock", goodsStock);
    if (goodsImage) formData.append("goods_image", goodsImage); // ✅ 이미지가 있으면 추가

    // 📌 데이터 확인 (콘솔 출력)
    console.log("📌 전송할 FormData:");
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
        let response = await fetchFileUpload(formData);
        console.log("✅ 응답:", response);
    } catch (err) {
        console.error("🚨 상품 등록 중 에러:", err);
        if (err.response && err.response.data) {
            console.log("📌 서버 응답:", err.response.data);
        }
    }
}






  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-6">
      <div className="w-full max-w-lg bg-gray-50 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-indigo-800 mb-6">상품 등록</h1>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">

          {/* 상품명 */}
          <div>
            <label className="block font-semibold text-gray-700">상품명</label>
            <input
              type="text"
              value={goodsName}
              onChange={(e) => setGoodsName(e.target.value)}
              className="w-full border border-gray-700 p-2 rounded-lg"
              placeholder="상품명"
              required
            />
          </div>

  
          {/* 대분류 & 중분류 (가로 정렬) */}
          <div className="flex space-x-4">
            {/* 대분류 */}
            <div className="w-1/2">
              <label className="block font-semibold text-gray-700">대분류</label>
              <select
                className="w-full p-2 border border-gray-700 rounded-lg focus:ring focus:ring-indigo-300"
                value={selectedFirstName}
                onChange={(e) => {
                  setSelectedFirstName(e.target.value);
                  setSelectedSecondName("");
                }}
              >
                <option value="">대분류 선택</option>
                {uniqueFirstNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 중분류 */}
            <div className="w-1/2">
              <label className="block font-semibold text-gray-700">중분류</label>
              <select
                className="w-full p-2 border border-gray-700 rounded-lg focus:ring focus:ring-indigo-300"
                value={selectedSecondName}
                onChange={handleSecondNameChange}
                disabled={!selectedFirstName}
              >
                <option value="">중분류 선택</option>
                {filteredSecondNames.map((category) => (
                  <option key={category.id} value={category.second_name}>
                    {category.second_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 소분류 */}
<div className="w-1/2">
  <label className="block font-semibold text-gray-700">소분류</label>
  <select
    className="w-full p-2 border border-gray-700 rounded-lg focus:ring focus:ring-indigo-300"
    value={subCategoryId}
    onChange={(e) => setSubCategoryId(e.target.value)}
    disabled={!categoryId} // 대분류를 먼저 선택해야 소분류 활성화
  >
    <option value="">소분류 선택</option>
    {filteredSubCategories.map((sub) => (
      <option key={sub.sub_category_id} value={sub.sub_category_id}>
        {sub.sub_category_name}
      </option>
    ))}
  </select>

</div>

          </div>

          
          {/* 상품 가격 */}
          <div>
            <label className="block font-semibold text-gray-700">상품 가격</label>
            <input
              type="number"
              value={goodsPrice} // useState로 관리
              onChange={(e) => setGoodsPrice(e.target.value)} // 값 변경 핸들러
              className="w-full border border-gray-700 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 가격"
              required
            />
          </div>
          {/* 상품 설명 */}
          <div>
            <label className="block font-semibold text-gray-700">상품 설명</label>
            <textarea
              value={goodsDescription} // useState로 관리
              onChange={(e) => setGoodsDescription(e.target.value)} // 값 변경 핸들러
              className="w-full border border-gray-700 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 설명"
              required
            />
          </div>

          {/* 재고 수량 */}
          <div>
            <label className="block font-semibold text-gray-700">재고 수량</label>
            <input
              type="number"
              value={goodsStock} // useState로 관리
              onChange={(e) => setGoodsStock(e.target.value)} // 값 변경 핸들러
              className="w-full border border-gray-700 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="재고 수량"
              required
            />
          </div>

          {/* 상품 이미지 */}
          <div>
            <label className="block font-semibold text-gray-700">상품 이미지</label>
            <input
              type="file"
              className="w-full p-2 border border-gray-700 rounded-lg"
              accept="image/*"
              required
              onChange={handleFileChange}
            />
          </div>
         
          {/* 미리보기 이미지 */}
          {previewUrl && (
            <div className="mt-4 text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">미리보기</h2>
              <img
                src={previewUrl}
                alt="상품 이미지 미리보기"
                className="w-[200px] h-[200px] object-cover border border-gray-300 rounded-lg shadow-md mx-auto"
              />
            </div>
          )}    

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
            상품 등록
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddGoods;
