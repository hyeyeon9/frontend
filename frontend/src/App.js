import "./App.css";
import { TimeProvider } from "./contexts/TimeContext";
import { UserProvider } from "./features/member/UserContext";
import Main from "./Main";

function App() {
  return (
    <UserProvider>
      <TimeProvider>
        <div className="bg-gray-50 h-full">
          <Main />
        </div>
      </TimeProvider>
    </UserProvider>
  );
}

export default App;
