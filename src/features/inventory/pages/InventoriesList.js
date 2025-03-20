import { useEffect, useMemo, useState } from "react";
import { fetchInventoryById, fetchInventoryList, updateStockById } from "../api/HttpService";
import { useFilters, useSortBy, useTable } from "react-table";
import { Link } from "react-router-dom";
import { fetchGoodsByCategory, fetchGoodsBySubCategory } from "../../goods/api/HttpService";

function InventoriesList() {
  const [inventoryList, setInventoryList] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newStock, setNewStock] = useState({});
  const [filterValue, setFilterValue] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [isVisible, setIsVisible]=useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 전체 재고현황 불러오는 메서드
  useEffect(() => {
    async function getInventoryList() {
      try {
        const data = await fetchInventoryList();
        console.log("data", data);
        setInventoryList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getInventoryList();
  }, []);

  // 테이블 헤더
  const columns = useMemo(
    () => [
      {Header : "재고 수정일", accessor : "stockUpdateAt"},
      {Header : "상품코드", accessor : "goodsId"},
      {Header : "상품명", accessor : "goodsName"},
      {Header : "재고 수량", accessor : "stockQuantity"},
      {Header : "재고 상태", accessor : "stockStatus"},
    ],
    []
  );

  const {getTableProps, 
        getTableBodyProps, 
        headerGroups, 
        rows, 
        prepareRow,
        setFilter}=
  useTable({columns, data:filteredInventory }, useFilters,useSortBy);

  useEffect(()=> {
    setFilter("stockStatus", filterValue);
  },[filterValue, setFilter]);

  useEffect(() => {
    setFilter("stockStatus", filterValue);
  }, [filterValue, setFilter]);

  // 테이블 합계 컬럼
  const totalStock = useMemo(() => {
    return filteredInventory.reduce((sum,item) => sum +(item.stockQuantity || 0 ), 0 );
  }, [filteredInventory])


  // 수정 버튼 클릭시  => 수정모드로 이동
  function handleEditStock(goodsId, currentStock){
    setEditingRow(goodsId); // 수정할 상품 번호 지정
    setNewStock((prev) => ({ ...prev, [goodsId]: currentStock }));
  }

  // 완료 버튼 클릭시  => 업데이트
  async function handleUpdateStock(goodsId){
    const updatedStock = newStock[goodsId];

    try {
      const response = await updateStockById(goodsId, updatedStock);
      console.log("재고 업데이트 완료", response);

      const data = await fetchInventoryById(goodsId);
      console.log("업데이트 된 재고", data);

      setInventoryList((list) =>
        list.map((item) =>
          item.goodsId === goodsId
            ? {
                ...item,
                stockQuantity: data.stockQuantity,
                stockStatus: data.stockStatus,
                stockUpdateAt: data.stockUpdateAt,
              }
            : item
        )
      );

      setEditingRow(null);
    } catch (error) {
      setError(error.message);
    }
  }

  const lowStockItems = inventoryList.filter(
    (item) => item.stockStatus === "재고부족"
  );

    // 대분류 상품 연결하기
    useEffect(() => {
      if(category && subCategory){  
        async function getGoodsListBySecondCategory() {
          try{
             const goodsList = await fetchGoodsBySubCategory(category, subCategory);

            const goodsIds = goodsList.map((item)=> item.goods_id);
            const filteredList = inventoryList.filter((item)=> goodsIds.includes(item.goodsId))
            setFilteredInventory(filteredList);

          }catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
       
        }
        getGoodsListBySecondCategory();
      }
      else if (category){
        async function getGoodsListByFirstCategory() {
          try {
            const goodsList  = await fetchGoodsByCategory(category);
    
            console.log("data", goodsList );
    
            const goodsIds =  goodsList.map((item)=> item.goods_id); // id가 담은 배열
            const filteredList = inventoryList.filter((item)=> goodsIds.includes(item.goodsId))
            setFilteredInventory(filteredList);
    
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
        getGoodsListByFirstCategory();
      }else{
        setFilteredInventory(inventoryList);
      }

     
    }, [category, subCategory, inventoryList]);


  return (
    <>
{!loading && !error && (
<div className="flex justify-center">
<div className="w-[1000px] max-h-[calc(100vh-150px)] overflow-auto mt-8">
  
  <div className="flex justify-between">
       <div className=" flex gap-5">
      <select onChange={(e) => setCategory((e.target.value))}>
        <option value="">대분류</option>
        <option value="식품">식품</option>
        <option value="음료">음료</option>
        <option value="생활용품">생활용품</option>
        <option value="디지털 & 문구">디지털 & 문구</option>
      </select>

      <select onChange={(e) => setSubCategory((e.target.value))}>
        <option value="">소분류</option>
        {category === "식품" ? (
                <>
                  <option value="즉석식품">즉석식품</option>
                  <option value="라면 & 면류">라면 & 면류</option>
                  <option value="베이커리 & 샌드위치">베이커리 & 샌드위치</option>
                  <option value="냉장/냉동식품">냉장/냉동식품</option>
                  <option value="과자 & 스낵">과자 & 스낵</option>
                  <option value="아이스크림 & 디저트">아이스크림 & 디저트</option>
                </>
        ) : category === "음료" ? (
<>
<option value="커피 & 차">커피 & 차</option>
          <option value="탄산음료">탄산음료</option>
          <option value="주스 & 건강음료">주스 & 건강음료</option>
          <option value="유제품 & 두유">유제품 & 두유</option>
          <option value="주류">주류</option>
</>
        ) : category === "생활용품" ? (
        <>
          <option value="위생용품">위생용품</option>
          <option value="욕실용품">욕실용품</option>
          <option value="뷰티 & 화장품">뷰티 & 화장품</option>
          <option value="의약 & 건강">의약 & 건강</option>
        </>
        ) : category === "디지털 & 문구" ? (
          <>
                  <option value="전자기기 & 액세서리">전자기기 & 액세서리</option>
                  <option value="문구류">문구류</option>
          </>
        ) : <></>}

      </select>

      <select onChange={(e) => setFilterValue((e.target.value))}>
        <option value="">전체</option>
        <option value="정상">정상</option>
        <option value="재고부족">재고부족</option>
      </select>
       </div>

        <div>
        <button 
        className="bg-red-500 px-3 py-2 text-white rounded hover:bg-red-700 mr-3"
        onClick={()=> setIsVisible(!isVisible)}> 
        재고현황
      </button>
        </div>
        {isVisible && (
    <div className="flex-col absolute right-4 mt-8 bg-white shadow-lg p-4 rounded border border-gray-300 w-80">
    <p className="font-bold text-red-500">재고 부족 상품❗</p>
    {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <div key={item.goodsId} className="text-sm text-gray-700 mt-2">
                      {item.goodsName} : <span className="font-bold">{item.stockQuantity}</span>개 남음
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mt-2">모든 상품이 정상 재고입니다.</p>
                )}

  </div>
        )}
  </div>
      
      <table  {...getTableProps()}
      border="1"
      className="w-full border-collapse border border-gray-300 mt-3"
    >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((c) => (
                <th {...c.getHeaderProps(c.getSortByToggleProps())}
                className="px-4 py-2 bg-gray-200">
                    {c.render("Header")}
                    <span>
                  {c.isSorted ? (c.isSortedDesc ? " 🔽" : " 🔼") : ""}
                </span>
                </th>
              ))}
              <th className="px-4 py-2 bg-gray-200">수정</th>

            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
           
            <tr {...row.getRowProps()} className="hover:bg-gray-100">
            
              {row.cells.map((cell) => {
              if(cell.column.id === "stockQuantity"){
                return(
                  <td>
                   {editingRow === row.original.goodsId ? (
                    <input type="number"
                    value={newStock[row.original.goodsId]}
                    min="0"
                    className="border p-1 w-20 text-center"
                    onChange={(e)=>setNewStock((prev)=>({...prev, [row.original.goodsId] : e.target.value}))}
                    >
                     
                    </input>
                   ) : (
                    row.original.stockQuantity
                   )}
                  </td>
                );
              }

              return(
                
               <td {...cell.getCellProps()} className="px-2 py-3 border">
               <Link  to={`/goods/findById/${row.original.goodsId}`}
               >
              {cell.column.id === "stockUpdateAt" 
              ? cell.value.replace("T", " ") :
              
              cell.column.id === "stockStatus" ?  (
                <span className={row.original.stockStatus === "재고부족" ? "text-red-500" : ""}>
                  {cell.render("Cell")}
                </span>
              ) : cell.render("Cell")
               }
                          
           </Link>
            </td>
              );
           
        })}

          <td className="px-4 py-2 border">

        {editingRow === row.original.goodsId ? (
                        <button 
                        className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-700"
                        onClick={() => handleUpdateStock(row.original.goodsId)}
                        >
                          완료
                        </button>
        ) : (
          <button 
          className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={() => handleEditStock(row.original.goodsId, row.original.stockQuantity)}
          >
            수정
          </button>
        )}
              </td>
              
            </tr>
          );
          setFilteredInventory(filteredList);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
      getGoodsListByFirstCategory();
    } else {
      setFilteredInventory(inventoryList);
    }
  }, [category, subCategory, inventoryList]);

  return (
    <>
      {!loading && !error && (
        <div className="flex justify-center">
          <div className="w-[1000px] max-h-[calc(100vh-150px)] overflow-auto mt-8">
            <div className="flex justify-between">
              <div className=" flex gap-5">
                <select onChange={(e) => setCategory(e.target.value)}>
                  <option value="">대분류</option>
                  <option value="식품">식품</option>
                  <option value="음료">음료</option>
                  <option value="생활용품">생활용품</option>
                  <option value="디지털 & 문구">디지털 & 문구</option>
                </select>

                <select onChange={(e) => setSubCategory(e.target.value)}>
                  <option value="">소분류</option>
                  {category === "식품" ? (
                    <>
                      <option value="즉석식품">즉석식품</option>
                      <option value="라면 & 면류">라면 & 면류</option>
                      <option value="베이커리 & 샌드위치">
                        베이커리 & 샌드위치
                      </option>
                      <option value="냉장/냉동식품">냉장/냉동식품</option>
                      <option value="과자 & 스낵">과자 & 스낵</option>
                      <option value="아이스크림 & 디저트">
                        아이스크림 & 디저트
                      </option>
                    </>
                  ) : category === "음료" ? (
                    <>
                      <option value="커피 & 차">커피 & 차</option>
                      <option value="탄산음료">탄산음료</option>
                      <option value="주스 & 건강음료">주스 & 건강음료</option>
                      <option value="유제품 & 두유">유제품 & 두유</option>
                      <option value="주류">주류</option>
                    </>
                  ) : category === "생활용품" ? (
                    <>
                      <option value="위생용품">위생용품</option>
                      <option value="욕실용품">욕실용품</option>
                      <option value="뷰티 & 화장품">뷰티 & 화장품</option>
                      <option value="의약 & 건강">의약 & 건강</option>
                    </>
                  ) : category === "디지털 & 문구" ? (
                    <>
                      <option value="전자기기 & 액세서리">
                        전자기기 & 액세서리
                      </option>
                      <option value="문구류">문구류</option>
                    </>
                  ) : (
                    <></>
                  )}
                </select>

                <select onChange={(e) => setFilterValue(e.target.value)}>
                  <option value="">전체</option>
                  <option value="정상">정상</option>
                  <option value="재고부족">재고부족</option>
                </select>
              </div>

              <div>
                <button
                  className="bg-red-500 px-3 py-2 text-white rounded hover:bg-red-700 mr-3"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  재고현황
                </button>
              </div>
              {isVisible && (
                <div className="flex-col absolute right-4 mt-8 bg-white shadow-lg p-4 rounded border border-gray-300 w-80">
                  <p className="font-bold text-red-500">재고 부족 상품❗</p>
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item) => (
                      <div
                        key={item.goodsId}
                        className="text-sm text-gray-700 mt-2"
                      >
                        {item.goodsName} :{" "}
                        <span className="font-bold">{item.stockQuantity}</span>
                        개 남음
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      모든 상품이 정상 재고입니다.
                    </p>
                  )}
                </div>
              )}
            </div>

            <table
              {...getTableProps()}
              border="1"
              className="w-full border-collapse border border-gray-300 mt-3"
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((c) => (
                      <th
                        {...c.getHeaderProps(c.getSortByToggleProps())}
                        className="px-4 py-2 bg-gray-200"
                      >
                        {c.render("Header")}
                        <span>
                          {c.isSorted ? (c.isSortedDesc ? " 🔽" : " 🔼") : ""}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-2 bg-gray-200">수정</th>
                  </tr>
                ))}
              </thead>

              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-100">
                      {row.cells.map((cell) => {
                        if (cell.column.id === "stockQuantity") {
                          return (
                            <td>
                              {editingRow === row.original.goodsId ? (
                                <input
                                  type="number"
                                  value={newStock[row.original.goodsId]}
                                  min="0"
                                  className="border p-1 w-20 text-center"
                                  onChange={(e) =>
                                    setNewStock((prev) => ({
                                      ...prev,
                                      [row.original.goodsId]: e.target.value,
                                    }))
                                  }
                                ></input>
                              ) : (
                                row.original.stockQuantity
                              )}
                            </td>
                          );
                        }

                        return (
                          <td
                            {...cell.getCellProps()}
                            className="px-2 py-3 border"
                          >
                            <Link
                              to={`/goods/findById/${row.original.goodsId}`}
                            >
                              {cell.column.id === "stockUpdateAt" ? (
                                cell.value.replace("T", " ")
                              ) : cell.column.id === "stockStatus" ? (
                                <span
                                  className={
                                    row.original.stockStatus === "재고부족"
                                      ? "text-red-500"
                                      : ""
                                  }
                                >
                                  {cell.render("Cell")}
                                </span>
                              ) : (
                                cell.render("Cell")
                              )}
                            </Link>
                          </td>
                        );
                      })}
    </div>

</div>
)}
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="3" className="px-4 py-2 border text-center">
                    총합
                  </td>
                  <td className="px-2 py-3 border">{totalStock}</td>
                  <td className="border"></td>
                  <td className="border"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default InventoriesList;
