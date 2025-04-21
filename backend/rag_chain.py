
from langchain.agents import Tool
from sales_tools import summarize_sales

# 판매 요약용 Langchain Tool 정의
rag_tool = Tool(
    name="SalesSummaryTool",
    func=summarize_sales,
    description="""
    특정 기간과 카테고리(서브카테고리)의 판매 데이터를 요약해주는 도구입니다.
    예: '3월에 삼각김밥 많이 팔렸어?', '1월부터 2월까지 햄버거 매출 알려줘'와 같은 질문에 사용됩니다.
    입력 형식: summarize_sales(start_date: str, end_date: str, category: Optional[str])
    """
)
