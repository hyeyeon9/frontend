import { useRef, useState } from "react";
import { fetchFileUpload } from "../api/httpService";

const categories = [
  { id: 1, first_name: "식품", second_name: "간편 식사" },
  { id: 2, first_name: "식품", second_name: "과자" },
  { id: 3, first_name: "식품", second_name: "아이스크림" },
  { id: 5, first_name: "음료", second_name: "일반음료" },
  { id: 6, first_name: "음료", second_name: "주류" },
  { id: 7, first_name: "생활용품", second_name: "일회용품" },
  { id: 8, first_name: "생활용품", second_name: "욕실용품" },
  { id: 9, first_name: "생활용품", second_name: "화장품" },
  { id: 16, first_name: "음료", second_name: "커피 & 차" },
  { id: 17, first_name: "음료", second_name: "탄산음료" },
  { id: 18, first_name: "음료", second_name: "주스 & 건강음료" },
  { id: 19, first_name: "음료", second_name: "유제품 & 두유" },
  { id: 25, first_name: "디지털 & 문구", second_name: "전자기기 & 액세서리" },
  { id: 26, first_name: "디지털 & 문구", second_name: "문구류" },
];

function AddGoods() {
  const goods_id = useRef(null);
  const goods_name = useRef(null);
  const goods_price = useRef(null);
  const goods_description = useRef(null);
  const goods_stock = useRef(null);
  const goods_image = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedSecondName, setSelectedSecondName] = useState("");
  const [categoryId, setCategoryId] = useState(""); // 선택된 카테고리 ID 저장

  const uniqueFirstNames = [...new Set(categories.map((c) => c.first_name))];
  const filteredSecondNames = categories.filter((c) => c.first_name === selectedFirstName);

  // 이미지 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
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

  // 상품 등록 요청
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("goods_id", goods_id.current.value);
    formData.append("category_id", categoryId); // 선택한 카테고리 ID 적용
    formData.append("goods_name", goods_name.current.value);
    formData.append("goods_price", goods_price.current.value);
    formData.append("goods_description", goods_description.current.value);
    formData.append("goods_stock", goods_stock.current.value);
    formData.append("goods_image", goods_image.current.files[0]);

    console.log("전송할 데이터:", formData);

    try {
      let response = await fetchFileUpload(formData);
      console.log("응답:", response);
    } catch (err) {
      console.error("상품 등록 중 에러:", err);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-6">
      <div className="w-full max-w-lg bg-gray-50 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-indigo-800 mb-6">상품 등록</h1>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">

          {/* 상품 ID */}
          <div>
            <label className="block font-semibold text-gray-700">상품 ID</label>
            <input
              type="text"
              ref={goods_id}
              className="w-full border border-gray-700 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 ID"
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
          </div>

          {/* 상품명 */}
          <div>
            <label className="block font-semibold text-gray-700">상품명</label>
            <input
              type="text"
              ref={goods_name}
              className="w-full border border-gray-700 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품명"
              required
            />
          </div>

          {/* 상품 가격 */}
          <div>
            <label className="block font-semibold text-gray-700">상품 가격</label>
            <input
              type="number"
              ref={goods_price}
              className="w-full border border-gray-700 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 가격"
              required
            />
          </div>

          {/* 상품 설명 */}
          <div>
            <label className="block font-semibold text-gray-700">상품 설명</label>
            <textarea
              ref={goods_description}
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
              ref={goods_stock}
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
              ref={goods_image}
              className="w-full p-2 border border-gray-700 rounded-lg cursor-pointer"
              accept="image/*"
              required
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
            상품 등록
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddGoods;
