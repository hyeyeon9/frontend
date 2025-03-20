import { useRef, useState } from "react";
import { fetchFileUpload } from "../api/HttpService";

function AddGoods() {
  const goods_id = useRef(null);
  const category_id = useRef(null);
  const goods_name = useRef(null);
  const goods_price = useRef(null);
  const goods_description = useRef(null);
  const goods_stock = useRef(null);
  const goods_image = useRef(null);

  //에러처리
  const [error, setError] = useState();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // ✅ 파일이 선택되면 상태 업데이트
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const goods_id2 = goods_id.current.value;
    const category_id2 = category_id.current.value;
    const goods_name2 = goods_name.current.value;
    const goods_price2 = goods_price.current.value;
    const goods_description2 = goods_description.current.value;
    const goods_stock2 = goods_stock.current.value;
    const goods_image2 = goods_image.current.files[0];

    let formData = new FormData();
    formData.append("goods_id", goods_id2);
    formData.append("category_id", category_id2);
    formData.append("goods_name", goods_name2);
    formData.append("goods_price", goods_price2);
    formData.append("goods_description", goods_description2);
    formData.append("goods_stock", goods_stock2);
    formData.append("goods_image", goods_image2);

    console.log("formData: ", formData);
    try {
      let response = await fetchFileUpload(formData);
      console.log("response: ", response);
    } catch (err) {
      console.log("App.fetchUserUpdate", err);
      setError({ message: "fetchUserUpdate 에러발생" });
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-6">
      <div className="w-full max-w-lg bg-gray-50 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-indigo-800 mb-6">
          상품 등록
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div>
            <label className="block font-semibold text-gray-700">상품 ID</label>
            <input
              type="text"
              name="goods_id"
              ref={goods_id}
              className="w-full border-gray-400 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 ID"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              카테고리 ID
            </label>
            <input
              type="text"
              name="category_id"
              ref={category_id}
              className="w-full border-gray-400 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="카테고리 ID"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">상품명</label>
            <input
              type="text"
              name="goods_name"
              ref={goods_name}
              className="w-full border-gray-400 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품명"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              상품 가격
            </label>
            <input
              type="number"
              name="goods_price"
              ref={goods_price}
              className="w-full border-gray-400 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 가격"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              상품 설명
            </label>
            <textarea
              name="goods_description"
              ref={goods_description}
              className="w-full border-gray-400 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="상품 설명"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              재고 수량
            </label>
            <input
              type="number"
              name="goods_stock"
              ref={goods_stock}
              className="w-full border-gray-400 p-2 rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="재고 수량"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              상품 이미지
            </label>
            <input
              type="file"
              name="goods_image"
              ref={goods_image}
              className="w-full p-2 border rounded-lg cursor-pointer"
              accept="image/*"
              required
              onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            상품 등록
          </button>
        </form>

        {selectedFile && (
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              이미지 미리보기
            </h2>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="상품 이미지"
              className="w-24 h-24 object-cover mx-auto border border-gray-300 rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AddGoods;
