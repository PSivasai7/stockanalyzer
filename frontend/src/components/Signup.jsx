import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate(); // 2. Initialize

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
      );
      alert(res.data.message);
      navigate("/login"); // 3. Redirect after success
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-center bg-amber-500 p-3 m-5 font-bold text-shadow-sm text-shadow-black text-white rounded-l-full rounded-r-full">
        Create an Account
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center gap-3"
      >
        <input
          className="border-2 p-1.5 rounded-[11px]"
          type="text"
          placeholder="Username"
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          className="border-2 p-1.5 rounded-[11px]"
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          className="border-2 p-1.5 rounded-[11px]"
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button
          type="submit"
          className=" p-1.5 pl-4 pr-4 border-2 border-b-cyan-950 cursor-pointer hover:rounded-2xl transition-all duration-150"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
