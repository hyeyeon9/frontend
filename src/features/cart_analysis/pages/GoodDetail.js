import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGoodsDetail } from "../api/HttpService";
import MenuNavigation from './../components/MenuNavigation';

function GoodsDetail() {
  const { id } = useParams();
  const [goods, setGoods] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getGoodsDetail() {
      try {
        const data = await fetchGoodsDetail(id);
        console.log(data);
        setGoods(data);
      } catch (error) {
        setError(error.message);
        console.log("error남");
      } finally {
        setLoading(false);
      }
    }
    getGoodsDetail();
  }, [id]);

  return (
    <>
      <MenuNavigation />
      {loading && <h1>로딩중 ...</h1>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="card p-3">
          카테고리 아이디 :{goods.category_id} <br></br>
          상품 이미지:{goods.goods_image} <br></br>
          상품 이름 : {goods.goods_name} <br></br>
          상품 가격 : {goods.goods_price} <br></br>
          상품 설명 : {goods.goods_description} <br></br>
          상품 등록일 : {goods.goods_created_at} <br></br>
          상품 조회수 : {goods.goods_views} <br></br>
          상품 주문수 : {goods.goods_orders} <br></br>
        </div>
      )}
    </>
  );
}

export default GoodsDetail;
