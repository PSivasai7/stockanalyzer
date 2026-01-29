import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Analyzer from './components/Analyzer';
import Intro from './components/Intro';
import logo from "./assets/logo.png";

function App() {
  // 1. Check for token and username in storage
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";

  // Helper to get first letter for the logo (e.g., "Sivasai" -> "S")
  const userInitial = username.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear(); // Clears token and username
    window.location.href = "/login";
  };

  return (
    <Router>
      {/* --- PROFESSIONAL NAVBAR --- */}
      <nav className="h-[15vh] bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">

        <img src={logo} alt="StockAnalyzer" className="h-full w-1xl rounded-full cursor-pointer" />


        <div className="flex items-center gap-6">
          {!token ? (
            // --- IF NOT LOGGED IN: SHOW LINKS ---
            <>
              <Link to="/signup" className="text-slate-400 hover:text-amber-500 hover:border-b-4 border-amber-600 px-5 py-2 rounded-full text-sm font-medium transition-all">Signup</Link>
              <Link to="/login" className=" hover:text-amber-500 text-gray-300 hover:border-b-4 border-amber-600 px-5 py-2 rounded-full text-sm font-medium transition-all">Login</Link>
            </>
          ) : (
            // --- IF LOGGED IN: SHOW AVATAR & NAME ---
            <div className="flex items-center gap-4">
              {/* <Link to="/analyze" className="text-slate-400 hover:text-white text-sm font-medium mr-2">Analyzer</Link> */}

              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <span className="text-slate-300 text-sm font-medium hidden md:block">
                  {username}
                </span>
                {/* The "Logo" Circle */}
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 uppercase">
                  {userInitial}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white hover:cursor-pointer transition-all duration-300 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        {/* <Route path="/intro" element={<Intro />} /> */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/analyze" element={token ? <Analyzer /> : <Navigate to="/login" />} />
        {/* Default to Intro for first-time vibes */}
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>

    </Router >
  );
}

export default App;