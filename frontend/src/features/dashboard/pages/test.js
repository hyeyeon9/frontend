// "use client"

// import { useState, useEffect } from "react"
// import {
//   BarChart,
//   CalendarDays,
//   Clock,
//   DollarSign,
//   Package,
//   ShoppingCart,
//   TrendingUp,
//   AlertTriangle,
//   ChevronRight,
// } from "lucide-react"

// function Dashboard() {
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [salesData, setSalesData] = useState({
//     today: 1250000,
//     yesterday: 980000,
//     percentChange: 27.55,
//   })

//   const [disposalProducts, setDisposalProducts] = useState([
//     { id: 1, name: "우유 1.5L", expiry: "2023-05-15", stock: 5, image: "/placeholder.svg?height=80&width=80" },
//     { id: 2, name: "샌드위치 세트", expiry: "2023-05-16", stock: 3, image: "/placeholder.svg?height=80&width=80" },
//     { id: 3, name: "과일 요거트", expiry: "2023-05-16", stock: 7, image: "/placeholder.svg?height=80&width=80" },
//   ])

//   const [expiringProducts, setExpiringProducts] = useState([
//     { id: 4, name: "신선한 샐러드", expiry: "2023-05-18", stock: 8, image: "/placeholder.svg?height=80&width=80" },
//     { id: 5, name: "도시락 세트", expiry: "2023-05-19", stock: 4, image: "/placeholder.svg?height=80&width=80" },
//     { id: 6, name: "과일 주스", expiry: "2023-05-20", stock: 6, image: "/placeholder.svg?height=80&width=80" },
//   ])

//   // 시간 업데이트
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date())
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [])

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount)
//   }

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "long", day: "numeric" }
//     return new Date(dateString).toLocaleDateString("ko-KR", options)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* 사이드바 */}
//       <div className="fixed inset-y-0 left-0 w-64 bg-indigo-700 text-white p-4 hidden md:block">
//         <div className="text-xl font-bold mb-8 mt-4">무인매장 관리 시스템</div>
//         <nav className="space-y-2">
//           <a href="#" className="flex items-center space-x-2 bg-indigo-800 p-3 rounded-lg">
//             <BarChart className="h-5 w-5" />
//             <span>대시보드</span>
//           </a>
//           <a href="#" className="flex items-center space-x-2 hover:bg-indigo-800 p-3 rounded-lg">
//             <Package className="h-5 w-5" />
//             <span>재고 관리</span>
//           </a>
//           <a href="#" className="flex items-center space-x-2 hover:bg-indigo-800 p-3 rounded-lg">
//             <ShoppingCart className="h-5 w-5" />
//             <span>발주 관리</span>
//           </a>
//           <a href="#" className="flex items-center space-x-2 hover:bg-indigo-800 p-3 rounded-lg">
//             <DollarSign className="h-5 w-5" />
//             <span>매출 분석</span>
//           </a>
//         </nav>
//       </div>

//       {/* 메인 콘텐츠 */}
//       <div className="md:ml-64 p-6">
//         {/* 헤더 */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
//             <div className="flex items-center text-gray-500 mt-1">
//               <CalendarDays className="h-4 w-4 mr-1" />
//               <span>{currentTime.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
//               <Clock className="h-4 w-4 ml-3 mr-1" />
//               <span>{currentTime.toLocaleTimeString("ko-KR")}</span>
//             </div>
//           </div>
//           <button className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
//             매장 상태 새로고침
//           </button>
//         </div>

//         {/* 요약 카드 */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">오늘 매출</p>
//                 <p className="text-2xl font-bold mt-1">{formatCurrency(salesData.today)}</p>
//               </div>
//               <div className="bg-indigo-100 p-3 rounded-lg">
//                 <DollarSign className="h-6 w-6 text-indigo-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <div className={`flex items-center ${salesData.percentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
//                 <TrendingUp className="h-4 w-4 mr-1" />
//                 <span>{salesData.percentChange}%</span>
//               </div>
//               <span className="text-gray-500 text-sm ml-2">어제 대비</span>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">폐기 예정 상품</p>
//                 <p className="text-2xl font-bold mt-1">{disposalProducts.length}개</p>
//               </div>
//               <div className="bg-red-100 p-3 rounded-lg">
//                 <AlertTriangle className="h-6 w-6 text-red-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-gray-500 text-sm">최근 3일 이내</span>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">유통기한 임박</p>
//                 <p className="text-2xl font-bold mt-1">{expiringProducts.length}개</p>
//               </div>
//               <div className="bg-yellow-100 p-3 rounded-lg">
//                 <Clock className="h-6 w-6 text-yellow-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-gray-500 text-sm">7일 이내</span>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">오늘 방문자 수</p>
//                 <p className="text-2xl font-bold mt-1">248명</p>
//               </div>
//               <div className="bg-green-100 p-3 rounded-lg">
//                 <ShoppingCart className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <div className="text-green-500 flex items-center">
//                 <TrendingUp className="h-4 w-4 mr-1" />
//                 <span>12%</span>
//               </div>
//               <span className="text-gray-500 text-sm ml-2">어제 대비</span>
//             </div>
//           </div>
//         </div>

//         {/* 차트와 상품 정보 */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* 매출 차트 */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-800">매출 추이</h2>
//               <select className="text-sm border rounded-md px-2 py-1">
//                 <option>오늘</option>
//                 <option>이번 주</option>
//                 <option>이번 달</option>
//               </select>
//             </div>
//             <div className="h-80 flex items-center justify-center">
//               {/* 차트 대신 이미지로 대체 */}
//               <div className="text-center">
//                 <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <div className="text-gray-500">
//                     <BarChart className="h-12 w-12 mx-auto mb-2" />
//                     <p>매출 차트가 여기에 표시됩니다</p>
//                   </div>
//                 </div>
//                 <div className="mt-4 flex justify-center space-x-6">
//                   <div className="flex items-center">
//                     <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
//                     <span className="text-sm">어제 매출</span>
//                   </div>
//                   <div className="flex items-center">
//                     <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
//                     <span className="text-sm">오늘 매출</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* 상품 정보 탭 */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="flex border-b">
//               <button className="flex-1 py-4 px-6 text-center font-medium text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600">
//                 폐기 예정
//               </button>
//               <button className="flex-1 py-4 px-6 text-center font-medium text-gray-500 hover:text-gray-700">
//                 유통기한 임박
//               </button>
//             </div>

//             <div className="p-4">
//               <ul className="divide-y">
//                 {disposalProducts.map((product) => (
//                   <li key={product.id} className="py-3 flex items-center">
//                     <img
//                       src={product.image || "/placeholder.svg"}
//                       alt={product.name}
//                       className="w-12 h-12 rounded-md object-cover mr-4"
//                     />
//                     <div className="flex-1">
//                       <h3 className="font-medium">{product.name}</h3>
//                       <p className="text-sm text-red-500">유통기한: {formatDate(product.expiry)}</p>
//                       <p className="text-sm text-gray-500">재고: {product.stock}개</p>
//                     </div>
//                     <button className="text-indigo-600 hover:text-indigo-800">
//                       <ChevronRight className="h-5 w-5" />
//                     </button>
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-4 text-center">
//                 <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
//                   모든 폐기 예정 상품 보기
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 추가 정보 섹션 */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-800">재고 현황</h2>
//               <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">자세히 보기</button>
//             </div>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">음료</span>
//                 <div className="flex items-center">
//                   <div className="w-48 h-2 bg-gray-200 rounded-full mr-2">
//                     <div className="h-full bg-indigo-600 rounded-full" style={{ width: "70%" }}></div>
//                   </div>
//                   <span className="text-sm font-medium">70%</span>
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">스낵</span>
//                 <div className="flex items-center">
//                   <div className="w-48 h-2 bg-gray-200 rounded-full mr-2">
//                     <div className="h-full bg-indigo-600 rounded-full" style={{ width: "45%" }}></div>
//                   </div>
//                   <span className="text-sm font-medium">45%</span>
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">도시락</span>
//                 <div className="flex items-center">
//                   <div className="w-48 h-2 bg-gray-200 rounded-full mr-2">
//                     <div className="h-full bg-indigo-600 rounded-full" style={{ width: "85%" }}></div>
//                   </div>
//                   <span className="text-sm font-medium">85%</span>
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">과일</span>
//                 <div className="flex items-center">
//                   <div className="w-48 h-2 bg-gray-200 rounded-full mr-2">
//                     <div className="h-full bg-indigo-600 rounded-full" style={{ width: "30%" }}></div>
//                   </div>
//                   <span className="text-sm font-medium">30%</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-800">최근 발주 현황</h2>
//               <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">자세히 보기</button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       발주번호
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       날짜
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       금액
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       상태
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   <tr>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">ORD-2023-0542</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2023.05.14</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₩450,000</td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                         배송 완료
//                       </span>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">ORD-2023-0541</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2023.05.12</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₩320,000</td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                         배송 중
//                       </span>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">ORD-2023-0540</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2023.05.10</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₩280,000</td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                         배송 완료
//                       </span>
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard