import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
  const [error, setError] = useState('');
  const [form, setForm] = useState({firstname: "", lastname: "", email: "", password: "" , role: "USER"});
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    validateForm();
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/;
    const nameRegex = /^[a-zA-Z ]+$/;
    const name = form.name?.trim();
    if (!nameRegex.test(name)) return 'Invalid name';
    if (!emailRegex.test(form.email)) return 'Invalid email';
    if (!passwordRegex.test(form.password)) return 'Password must be at least 6 characters';
    return false; // No error
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg){ //return setError(errorMsg);
      toast.error(errorMsg); // Use toast for error messages
      console.error(errorMsg); 
      return;
    }
     setLoading(true);      
    try {
      //console.log("Form data:", form); // Debugging line to check form data
      const response = await axios.post("https://maya-backend-service-326007673689.us-central1.run.app/auth/registerUser", form);
      setLoading(false);
      toast.success('Your Registration has been successfully Done!');
      console.log('Success:', response.data);
      navigate("/login");
    } catch (err) {
      setLoading(false);
      if(err.response?.status === 409) {
        toast.error(err.response?.data);
      }else{toast.error(err.response?.data?.message || "Registration failed Please try again later.");}
      console.log("Error during registration:", err);
      
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstname"
            placeholder="Firstname"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Lastname"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Username"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="w-full border p-2 pr-10 rounded"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Loading Spinner */}
                {loading && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-teal-200">
                      
                      {/* Bouncing Dots Loader */}
                      <div className="flex space-x-1 mb-4">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-300"></div>
                      </div>

                      {/* Humorous Text */}
                      <p className="text-teal-700 text-xl font-semibold animate-pulse mb-2">
                        Creating your gateway to awesome <span className="inline-block">💡</span>
                      </p>
                      <p className="text-sm text-gray-500 italic mt-1">
                        Just double-checking you’re not a robot... 🤖
                      </p>
                    </div>
                  </div>
                )}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
