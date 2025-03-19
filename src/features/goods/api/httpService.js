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
       // return response.data;
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