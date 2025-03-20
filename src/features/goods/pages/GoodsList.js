import { useEffect, useState } from "react";
import { fetchGoodsList } from "../api/HttpService";
import { Link } from "react-router-dom";
import MenuNavigation from "../components/MenuNavigation";

function GoodsList() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getGoodsList() {
      try {
        const data = await fetchGoodsList();
        console.log(data);
        setGoodsList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsList();
  }, []);

  function handleClickEvent() {}

  return (
    <div className="container p-3">
      <MenuNavigation />
      {loading && <h1>로딩중 ..ddd.</h1>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="row g-2">
          {goodsList.map((item) => (
            <div className="col-md-3 mb-4 col-sm-6" key={item.goods_id}>
              <Link
                to={`/goods/findById/${item.goods_id}`}
                onClick={() => {
                  handleClickEvent();
                }}
              >
                <div className="card p-3">
                  카테고리 아이디 :{item.category_id} <br></br>
                  상품 이미지:{item.goods_image} <br></br>
                  상품 이름 : {item.goods_name} <br></br>
                  상품 가격 : {item.goods_price} <br></br>
                  상품 설명 : {item.goods_description} <br></br>
                  상품 등록일 : {item.goods_created_at} <br></br>
                  상품 조회수 : {item.goods_views} <br></br>
                  상품 주문수 : {item.goods_orders} <br></br>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GoodsList;
