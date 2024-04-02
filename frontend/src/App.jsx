import Accounts from "./Accounts.jsx";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="flex w-screen">
      <Routes>
        <Route path="/" element={<Accounts />} />
      </Routes>
    </div>
  );
}

export default App;
