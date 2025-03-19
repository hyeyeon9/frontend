import { useEffect, useState } from "react";
import { fetchGoodsByCategory } from "../api/HttpService";
import { Link, useParams } from "react-router-dom";
import MenuNavigation from './../components/MenuNavigation';

function GoodsByCategory() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const { firstname } = useParams(); // url의 파리미터 값 받아오기
  
  console.log("firstName", firstname);

  const [category, setCategory] = useState("");

  // 대분류 상품 이름을 영어 => 한글 로 변경
  useEffect(() => {
    if (firstname === "food") {
      setCategory("식품");
    } else if (firstname === "drink") {
      setCategory("음료");
    } else if (firstname === "household") {
      setCategory("생활용품");
    } else if (firstname === "digital") {
      setCategory("디지털 & 문구");
    }
    console.log("카테고리 : ", category)
  }, [firstname]);

  // 대분류 상품 연결하기
  useEffect(() => {
    if (!category) return;

    async function getGoodsListByFirstCategory() {
      try {
        const data = await fetchGoodsByCategory(category);

        console.log("data", data);

        setGoodsList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsListByFirstCategory();
  }, [category]);

  return (
    <>
      <div className="container p-3">
      <MenuNavigation />
        {loading && <h1>로딩중 ...</h1>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className="row g-2">
            {goodsList.map((item) => (
              <div key={item.goods_id} className="col-md-3 col-sm-6">
                <Link to={`/goods/findById/${item.goods_id}`}>
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
    </>
  );
}

export default GoodsByCategory;
