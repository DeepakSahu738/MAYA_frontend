import React from "react"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getRoleFromToken, getUserIdFromToken } from "./tokenDecoder/detokenizer";
import axios from "axios";
import { useEffect } from "react";

export default function UserAccountMgnt(){
    const [error, setError] = React.useState(null);
    const [userData, setUserData] = React.useState(null);
     const navigate = useNavigate();
    const handleLogout = () => {
        // Clear session storage or perform logout logic
        sessionStorage.removeItem('token');
        toast.success("You have been logged out Successfully.");
        navigate('/login'); // Redirect to login page
        
    }
    const handleUserData = async () => {
            const token = sessionStorage.getItem('token'); 
        const userID = getUserIdFromToken(sessionStorage.getItem('token'));
    try {
      const response = await axios.get("http://localhost:9090/auth/getUserById/"+userID,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request headers
                    },
                } );

      const data = response.data;

      if (response.status === 200) {
        console.log('User data fetched successfully:', data);
        setUserData(data);
      } else {
        toast.error(data.message || 'fetching user data failed Please Refresh the page.');
      }
    } catch (err) {
      console.error('User error:', err);
      toast.error('An error occurred while fetching user data. Please refresh the page.');
    }
  };
  // ✅ Fetch data only once on mount
        useEffect(() => {handleUserData();}, []); // empty dependency array → only runs once

    return (
        <div id="UserAccountMgnt">
            <div className="min-h-screen bg-gray-50 font-sans pt-16">
                {/* Account Dashboard */}
                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mr-4">
                                        <span className="material-symbols-outlined text-3xl">person</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{userData?.name}</h2>
                                        <p className="text-sm text-gray-500">Premium Member</p>
                                    </div>
                                </div>
                                <nav className="space-y-2">
                                    <a
                                        href="#"
                                        className="flex items-center p-3 rounded-md bg-teal-50 text-teal-600 font-medium hover:bg-teal-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined mr-3">account_circle</span>
                                        Account Details
                                    </a>
                                    <a
                                        href="#previous-results"
                                        className="flex items-center p-3 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined mr-3">history</span>
                                        Previous Results
                                    </a>
                                    <a
                                        href="#"
                                        className="flex items-center p-3 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined mr-3">settings</span>
                                        Settings
                                    </a>
                                    <a
                                        href="#"
                                        className="flex items-center p-3 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined mr-3">help</span>
                                        Help & Support
                                    </a>
                                    <a
                                        href="#"
                                        className="flex items-center p-3 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                                        onClick={handleLogout}
                                    >
                                        <span className="material-symbols-outlined mr-3">logout</span>
                                        Logout
                                    </a>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="w-full lg:w-3/4">
                            {/* Account Details Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-800">Account Details</h2>
                                    <button className="text-sm text-teal-600 border border-teal-600 rounded-md px-4 py-1.5 hover:bg-teal-50 transition-colors flex items-center">
                                        <span className="material-symbols-outlined mr-1 text-sm">edit</span>
                                        Edit Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Username
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-md text-gray-800">{userData?.name|| "NA"}</div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Email Address
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-md text-gray-800">
                                                {userData?.email|| "NA"}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Account Type
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-md text-gray-800">Premium Plan</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Joined Date
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-md text-gray-800">
                                                {userData?.createdDate|| "NA"}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Your Firstname
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-md text-gray-800">
                                                {userData?.firstname || "NA"}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Your Lastname
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-md text-gray-800">
                                                {userData?.lastname || "NA"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                                        Data Modification Request
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Need to change your personal information? Submit a request and our team will
                                        assist you.
                                    </p>
                                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center">
                                        <span className="material-symbols-outlined mr-2">contact_support</span>
                                        Request Data Modification
                                    </button>
                                </div>
                            </div>

                            {/* Previous Results Section */}
                            <div id="previous-results" className="bg-white rounded-lg shadow-sm p-6 pointer-events-none opacity-30">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-800">Previous Results(coming soon)</h2>
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search results"
                                                className="border border-gray-300 rounded-md px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
                                                search
                                            </span>
                                        </div>
                                        <div className="ml-2">
                                            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                                                <option>All Time</option>
                                                <option>Last 7 Days</option>
                                                <option>Last 30 Days</option>
                                                <option>Last 90 Days</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Date
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Campaign
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Platform
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Oct 10, 2023
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Summer Sale 2023
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center">
                                                        <i className="fa-brands fa-facebook text-blue-600 mr-2"></i>
                                                        Facebook
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Completed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href="#" className="text-teal-600 hover:text-teal-900 mr-3">
                                                        View
                                                    </a>
                                                    <a href="#" className="text-gray-600 hover:text-gray-900">
                                                        Export
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Oct 5, 2023
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Product Launch
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center">
                                                        <i className="fa-brands fa-instagram text-pink-600 mr-2"></i>
                                                        Instagram
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Completed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href="#" className="text-teal-600 hover:text-teal-900 mr-3">
                                                        View
                                                    </a>
                                                    <a href="#" className="text-gray-600 hover:text-gray-900">
                                                        Export
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Sep 28, 2023
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Holiday Special
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center">
                                                        <i className="fa-brands fa-facebook text-blue-600 mr-2"></i>
                                                        Facebook
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        In Progress
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href="#" className="text-teal-600 hover:text-teal-900 mr-3">
                                                        View
                                                    </a>
                                                    <a href="#" className="text-gray-600 hover:text-gray-900">
                                                        Export
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Sep 15, 2023
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Weekly Newsletter
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center">
                                                        <i className="fa-brands fa-linkedin text-blue-700 mr-2"></i>
                                                        LinkedIn
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Failed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href="#" className="text-teal-600 hover:text-teal-900 mr-3">
                                                        View
                                                    </a>
                                                    <a href="#" className="text-gray-600 hover:text-gray-900">
                                                        Export
                                                    </a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-600">Showing 1 to 4 of 24 entries</div>
                                    <div className="flex gap-2">
                                        <button className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                                            Previous
                                        </button>
                                        <button className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                                            1
                                        </button>
                                        <button className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                                            2
                                        </button>
                                        <button className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                                            3
                                        </button>
                                        <button className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
