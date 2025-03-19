import "./App.css";
import { TimeProvider } from "./contexts/TimeContext";
import Main from "./Main";

function App() {
  return (
    <TimeProvider> {/** 모든 컴포넌트에서 time데이터를 사용할 수 있도록 */}
      <div className="content">
        <Main />
      </div>
    </TimeProvider>
  );
}

export default App;
