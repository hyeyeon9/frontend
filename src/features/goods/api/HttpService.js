import axios from "axios";


// 상품 저장 (파일 포함)
export const saveGoods = async (formData) => {
  console.log("formData1:", formData)
  try {
      const response = await axios.post("http://localhost:8090/app/goods/save", 
          formData, {
        headers: {
          "Content-Type":"multipart/form-data"
          
        }
      });
     return response.data;

  } catch (error) {
      console.error("상품 등록 중 에러 발생:", error);
      throw error;
  }
};

export async function fetchFileUpload(formData) {
  const response = await axios.post("http://localhost:8090/app/goods/save" , formData,
      {
          headers: {
            "Content-Type": "multipart/form-data",
          }
      }
  );  // user는  JSON 형식임

    if (!response === 200) {  // 무조건 200 이 아님. 서버에서 응답하는 statsu 확인 필요.
           throw new Error('Failed to insert user data.');
    }
    
      
    var  resData = await response.data;
         console.log("resData:" , resData)
    return resData;
}






// 1. 전체 상품 목록 가져오기
export async function fetchGoodsList() {
  const response = await axios.get(
    `http://localhost:8090/app/categories/findAll`
  );

  if (response.status !== 200) {
    console.log("에러");
    throw new Error("fetchUserList 예외발생");
  }

  return response.data;
}

// 2. 선택한 상품 정보 가져오기
export async function fetchGoodsDetail(id) {
  const response = await axios.get(
    `http://localhost:8090/app/goods/findById/${id}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGoodsDetail 예외발생");
  }

  return response.data;
}

// 3. 카테고리별 정렬 (대분류)
export async function fetchGoodsByCategory(firstname) {
  const response = await axios.get(
    `http://localhost:8090/app/categories/${firstname}`
  );

  console.log(response);
  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGoodsByCategory 예외발생");
  }

  return response.data;
}

// 4. 카테고리별 정렬 (소분류)
export async function fetchGoodsBySubCategory(firstname, secondName) {
  const response = await axios.get(
    `http://localhost:8090/app/categories/${firstname}/${secondName}`
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchGoodsBySubCategory 예외발생");
  }

  console.log(response.data);
  return response.data;
}

