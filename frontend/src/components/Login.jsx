import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);

      alert(`Welcome back!`);

      // 4. Force navigation to the analyzer
      // Use window.location.href if you want a full refresh to reset state
      window.location.href = "/analyze";
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-center bg-amber-500 p-3 m-5 font-bold text-shadow-sm text-shadow-black text-white rounded-l-full rounded-r-full">
        Login
      </h2>
      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center justify-center gap-3"
      >
        <input
          className="border-2 p-1.5 rounded-[11px]"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border-2 p-1.5 rounded-[11px]"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="p-1.5 pl-4 pr-4 border-2 border-b-cyan-950 cursor-pointer hover:rounded-2xl transition-all duration-150"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
