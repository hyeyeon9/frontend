import { useEffect, useMemo, useState } from "react";
import { fetchInventoryById, fetchInventoryList, updateStockById } from "../api/HttpService";
import { useSortBy, useTable } from "react-table";
import { Link } from "react-router-dom";

function InventoriesList() {
  const [inventoryList, setInventoryList] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newStock, setNewStock] = useState({});

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInventoryList() {
      try {
        const data = await fetchInventoryList();
        console.log("data",data);
        setInventoryList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getInventoryList();
  }, []);

  // 헤더
  const columns = useMemo(
    () => [
      {Header : "재고 수정일", accessor : "stockUpdateAt"},
      {Header : "품목코드", accessor : "goodsId"},
      {Header : "품목명", accessor : "goodsName"},
      {Header : "재고 수량", accessor : "stockQuantity"},
      {Header : "재고 상태", accessor : "stockStatus"},
    ],
    []
  );

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow}=
  useTable({columns, data:inventoryList}, useSortBy);


  const totalStock = useMemo(() => {
    return inventoryList.reduce((sum,item) => sum +(item.stockQuantity || 0 ), 0 );
  }, [inventoryList])

  // 수정 버튼 클릭시 
  function handleEditStock(goodsId, currentStock){
    setEditingRow(goodsId); // 수정할 상품 번호 지정
    setNewStock((prev) => ({...prev, [goodsId] : currentStock}));
  }

  // 완료 버튼 클릭시
  async function handleUpdateStock(goodsId){
    const updatedStock = newStock[goodsId];

    try{
      const response =  await updateStockById(goodsId, updatedStock);
      console.log("재고 업데이트 완료", response);

      const data = await fetchInventoryById(goodsId);
      console.log("업데이트 된 재고", data);

      setInventoryList((list) => 
      list.map((item) => item.goodsId === goodsId ? 
      ({...item, 
        stockQuantity : data.stockQuantity,
        stockStatus : data.stockStatus,
        stockUpdateAt : data.stockUpdateAt,
      }) : item
    ));


    setEditingRow(null);
    }catch(error){
      setError(error.message)
    }

  }


  return (
    <>
{!loading && !error && (
<div className="flex justify-center">
<div className="w-[1000px] max-h-[calc(100vh-150px)] overflow-auto mt-8">
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
                        className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-700"
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
        })}
      </tbody>

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
