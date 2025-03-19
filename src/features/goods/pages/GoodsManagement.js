import { Link } from "react-router-dom";

function GoodsManagement(){
    return(
        <>
        <h1>
        GoodsManagement
        </h1>
        <Link to ="/goods/manage/add">
            <div>상품 등록</div>
        </Link>
        </>
    )
}

export default GoodsManagement;