import Home from "./Home.jsx";
import Accounts from "./Accounts.jsx";
import Transactions from "./Transactions.jsx";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <nav className="bg-[#145da0] p-4 md:px-12 flex justify-between">
        <div>
          <Link to="/" className="text-white font-bold">
            e-Wallet
          </Link>
        </div>
        <ul className="flex justify-center space-x-4">
          <li>
            <Link to="/accounts" className="text-white hover:text-gray-300">
              Accounts
            </Link>
          </li>
          <li>
            <Link to="/transactions" className="text-white hover:text-gray-300">
              Transactions
            </Link>
          </li>
        </ul>
      </nav>
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
