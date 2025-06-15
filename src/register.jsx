import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Register() {
  const [error, setError] = useState('');
  const [form, setForm] = useState({firstname: "", lastname: "", email: "", password: "" , role: "USER"});
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg){ //return setError(errorMsg);
      toast.error(errorMsg); // Use toast for error messages
      console.error(errorMsg); 
      return;
    }
           
    try {
      console.log("Form data:", form); // Debugging line to check form data
      const response = await axios.post("http://localhost:9090/auth/registerUser", form);
      toast.success('Your Registration has been successfully Done!');
      console.log('Success:', response.data);
      navigate("/login");
    } catch (err) {
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
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
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
