import { Link } from "react-router-dom";

function GoodsManagement(){
    return(
        <>
        <h1>상품 관리 페이지</h1>

        <Link to="/goods/manage/add">
             <div> 상품 등록 </div>
        </Link>

        </>
    )
}

export default GoodsManagement;