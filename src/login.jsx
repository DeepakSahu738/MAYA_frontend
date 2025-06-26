import React, { useState } from "react";
import axios from "axios";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({email: "",password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://maya-backend-service-326007673689.us-central1.run.app/auth/login", form);

      const data = response.data;

      if (response.status === 200) {
        sessionStorage.setItem('token', data);
        console.log("Token stored in sessionStorage:", sessionStorage.getItem('token'));
        toast.success("Login Successful!");
        navigate('/');
      } else if(response.status === 403) {
        toast.error("Login  failed: Invalid credentials");
      }
    } catch (err) {
      console.error('Login error:', err);
      if(err.response.status === 403) {
        toast.error("Login  failed: Invalid credentials");
      }else{
      toast.error("Login  failed:  " + (err.response?.data?.message || 'Server error. Please try again later.'));
    }
    }
  };
  

  const handleGuestLogin = async () => {
    // Use hardcoded guest credentials or skip auth check
    try {
      const form = { email: "GUEST", password: "GUEST" }; // Hardcoded guest credentials
      const response = await axios.post("https://maya-backend-service-326007673689.us-central1.run.app/auth/login", form);

      const data = response.data;
      if(sessionStorage.getItem('token')) {
        toast.error("You have already logged in as a guest once.");
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
    <div className="pt-20 flex min-h-screen items-center justify-center bg-gray-100 px-4">
  <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-lg shadow-lg overflow-hidden bg-white">
    
    {/* Left Panel */}
    <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-indigo-300 to-purple-300 text-white flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4">Your personal assistant is waiting</h2>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>Personalized recommendations</li>
        <li>Seamless integration with your tools</li>
        <li>Free updates and new features</li>
      </ul>
    </div>

    {/* Right Panel */}
    <div className="w-full md:w-1/2 p-8 space-y-6">
      <div className="flex justify-evenly bg-neutral-200 p-2 rounded">
        <button className="text-lg font-semibold text-gray-900">Login</button>
        <a href="/register">
          <button className="text-lg font-semibold text-gray-500 hover:text-black">Register</button>
        </a>
      </div>

      <input
        type="text"
        name="email"
        placeholder="Enter your email"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    name="password"
    placeholder="Enter your password"
    value={form.password}
    onChange={handleChange}
    className="w-full p-2 pr-10 border rounded"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>


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

      <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-2 sm:space-y-0">
        <button className="flex items-center justify-center px-4 py-2 border rounded hover:bg-gray-100 w-full sm:w-auto">
          <FaFacebook className="mr-2" /> Facebook
        </button>
        <button className="flex items-center justify-center px-4 py-2 border rounded hover:bg-gray-100 w-full sm:w-auto">
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
