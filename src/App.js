import "./App.css";
import { TimeProvider } from "./contexts/TimeContext";
import Main from "./Main";

function App() {
  return (
    <TimeProvider>
      <div className="content">
        <Main />
      </div>
    </TimeProvider>
  );
}

export default App;
