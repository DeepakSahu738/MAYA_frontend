import React, { useState } from "react";
import axios from "axios";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({name: "",password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:9090/auth/login", form);

      const data = response.data;

      if (response.status === 200) {
        sessionStorage.setItem('token', data);
        console.log("Token stored in sessionStorage:", sessionStorage.getItem('token'));
        toast.success("Login Successful!");
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
    }
  };
  

  const handleGuestLogin = async () => {
    // Use hardcoded guest credentials or skip auth check
    try {
      const form = { name: "GUEST", password: "GUEST" }; // Hardcoded guest credentials
      const response = await axios.post("http://localhost:9090/auth/login", form);

      const data = response.data;
      if(sessionStorage.getItem('token')) {
        toast.error("You are already logged in as a guest.");
        return;
      }
      if (response.status === 200) {
        sessionStorage.setItem('token', data);
        console.log("Token stored in sessionStorage:", sessionStorage.getItem('token'));
        
        toast.success("Guest Login Successful!");
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
      toast.error('Server error. Please try again later.');
    }

  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="pt-20 flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex w-[80%] max-w-4xl rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Left Panel */}
        <div className="w-1/2 p-8 bg-gradient-to-br from-indigo-300 to-purple-300 text-white flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">Your personal assistant is waiting</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Personalized recommendations</li>
            <li>Seamless integration with your tools</li>
            <li>Free updates and new features</li>
          </ul>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 p-8 space-y-6">
          <div className="flex justify-evenly bg-neutral-200 p-2">
            <button className=" text-lg font-semibold  border-gray-800 text-center ">Login</button>
            <a href="/register" className="text-blue-600 hover:underline ">
            <button className="text-lg justify-center text-center font-semibold text-gray-500 hover:text-black">Register</button>
            </a>
          </div>

          <input
            type="text"
            name="name"
            placeholder="Enter your username"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <div className="flex justify-between items-center text-sm">
            <label>
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-blue-600">Forgot your password?</a>
          </div>

          <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">
            Sign in
          </button>

          <p className="text-center text-gray-400">Or continue with</p>

          <div className="flex justify-center space-x-4">
            <button //onClick={handleFacebookLogin} 
            className="flex items-center px-4 py-2 border rounded hover:bg-gray-100">
              <FaFacebook className="mr-2" /> Facebook
            </button>
            <button //onClick={handleGoogleLogin} 
            className="flex items-center px-4 py-2 border rounded hover:bg-gray-100">
              <FaGoogle className="mr-2" /> Google
            </button>
          </div>

          <button onClick={handleGuestLogin} className="w-full mt-4 text-sm underline text-center text-gray-600 hover:text-black">
            Continue as Guest
          </button>

        </div>
      </div>
    </div>
  );
}
