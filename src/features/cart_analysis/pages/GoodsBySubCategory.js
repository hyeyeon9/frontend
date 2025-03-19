import { useEffect, useState } from "react";
import { fetchGoodsBySubCategory } from "../api/HttpService";
import { Link, useParams } from "react-router-dom";
import MenuNavigation from './../components/MenuNavigation';

function GoodsBySubCategory() {
  const [goodsList, setGoodsList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const { firstname, secondname } = useParams(); // URL에서 파라미터 값 받아오기
  
  console.log("파라미터 값 :", firstname, secondname);

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  console.log("서브카테고리", subCategory);
  useEffect(() => {
    if (secondname === "instantMeal") {
      setCategory("식품");
      setSubCategory("즉석식품");
    } else if (secondname === "noodles") {
      setCategory("식품");
      setSubCategory("라면 & 면류");
    } else if (secondname === "bakerySandwich") {
      setCategory("식품");
      setSubCategory("베이커리 & 샌드위치");
    } else if (secondname === "refrigeratedFrozen") {
      setCategory("식품");
      setSubCategory("냉장/냉동식품");
    } else if (secondname === "snacks") {
      setCategory("식품");
      setSubCategory("과자 & 스낵");
    } else if (secondname === "icecreamDessert") {
      setCategory("식품");
      setSubCategory("아이스크림 & 디저트");
    } 
    
    else if (secondname === "coffeeTea") {
      setCategory("음료");
      setSubCategory("커피 & 차");
    } else if (secondname === "carbonatedDrinks") {
      setCategory("음료");
      setSubCategory("탄산음료");
    }else if (secondname === "juiceHealth") {
      setCategory("음료");
      setSubCategory("주스 & 건강음료");
    } 
    else if (secondname === "dairySoymilk") {
      setCategory("음료");
      setSubCategory("유제품 & 두유");
    } else if (secondname === "alcohol") {
      setCategory("음료");
      setSubCategory("주류");
    } 
    
    else if (secondname === "hygieneProducts") {
      setCategory("생활용품");
      setSubCategory("위생용품");
    } else if (secondname === "bathroomSupplies") {
      setCategory("생활용품");
      setSubCategory("욕실용품");
    } else if (secondname === "beautyCosmetics") {
      setCategory("생활용품");
      setSubCategory("뷰티 & 화장품");
    } else if (secondname === "medicineHealth") {
      setCategory("생활용품");
      setSubCategory("의약 & 건강");
    }

    else if (secondname === "electronicsAccessories") {
      setCategory("디지털 & 문구");
      setSubCategory("전자기기 & 액세서리");
    } else if (secondname === "stationery") {
      setCategory("디지털 & 문구");
      setSubCategory("문구류");
    }

  }, [secondname]);

  // 소분류 상품 등록 연결하기
  useEffect(() => {
    if (!subCategory) return;

    async function getGoodsListBySecondCategory() {
      try {
        const data = await fetchGoodsBySubCategory(category, subCategory);
        setGoodsList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getGoodsListBySecondCategory();
  }, [subCategory]);

  return (
    <>
      <div className="container p-3">
      <MenuNavigation />
        {loading && <h1>로딩중 ..</h1>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className="row g-2">
            {goodsList.map((item) => (
              <div className="col-md-3 mb-4 col-sm-6" key={item.goods_id}>
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

export default GoodsBySubCategory;
