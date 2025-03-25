import "./App.css";
import { TimeProvider } from "./contexts/TimeContext";
import { UserProvider } from "./features/member/UserContext";
import Main from "./Main";

function App() {
  return (
    <UserProvider>
      <TimeProvider>
        <div className="content">
          <Main />
        </div>
      </TimeProvider>
    </UserProvider>
  );
}

export default App;
