import {React,useState} from "react";

import { Link,useNavigate } from "react-router-dom";

import { toast } from 'react-toastify';

import { getRoleFromToken , isJwtExpired } from "./tokenDecoder/detokenizer";

const Header = () => {
  let flagForLoginRegisterButtonWhenUserTokenExpired = false; // This flag is used to show the login/register button when the user token is expired
  const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);
   const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // For mobile nav

  const goToFeatures = () => {
    navigate("/", { state: { scrollTo: "features" } });
  };
  const goToAbout = () => {
    navigate("/", { state: { scrollTo: "about" } });
  };
  const goToContact = () => {
    navigate("/", { state: { scrollTo: "contact" } });
  }
  const checkForToken = () => {
    const token = sessionStorage.getItem('token');
    const role = getRoleFromToken(token);
    if (role === "USER" && !isJwtExpired(token)) {
      console.log("Token exists, navigating to UserAccountMgnt"+isJwtExpired(token));
      // Token exists, navigate to UserAccountMgnt
      navigate("/UserAccountMgnt"); 
    } else if(role=="USER" && isJwtExpired(token)) {
      // Show a toast notification
      toast.error("Your session has expired. Please login again.");
      // Token exists but is expired, navigate to login
      navigate("/login");
    }
    else {
      // Show a toast notification
      toast.error("Please Register/login to access your account. A guest cant access the account management page.");
      // Token does not exist, navigate to login
      navigate("/login");
    }
  };
  const token = sessionStorage.getItem('token');
  const role = token ? getRoleFromToken(token) : null;
  if(token !== null) {
  if(isJwtExpired(token) && role === "USER") {
    flagForLoginRegisterButtonWhenUserTokenExpired = true ;} }
  // Show buttons if token is not present or contains 'guest' or logged in user token is expired
  const shouldShowButtons = !token || role === "GUEST"|| flagForLoginRegisterButtonWhenUserTokenExpired;
  
  return (
    <header className="fixed flex z-20 items-center justify-between px-6 py-4 border-b border-gray-100 shadow-md bg-white w-full">
                    <div className="flex items-center space-x-8">
                    <a href="/">
                      <div className="flex items-center">
                            {/* <div className="flex items-center justify-center w-10 h-10 rounded-md bg-teal-600 text-white font-bold text-xl"> */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-md">
                            <img
                                src="/logo.png"
                                alt="Dashboard Screenshot"
                                className="rounded-xl w-96 h-auto"
                              />
                            </div>
                            <span className="ml-2 font-bold text-xl text-gray-800">MAYA</span>
                        </div>
                        </a>

                        <nav className="hidden md:flex items-center space-x-5">
                            <a href="#features" onClick={() => {goToFeatures(); setIsOpen(false);}} className="text-gray-600 hover:text-gray-900 transition-colors">
                                Features
                            </a>

                            <a href="#about" onClick={() => {goToAbout(); setIsOpen(false);}}
                            className="text-gray-600 hover:text-gray-900 transition-colors">
                              About 
                            </a>

                            <div className="relative">
                                      <button
                                        onClick={() => setIsOpen((prev) => !prev)}
                                        className="text-gray-600 hover:text-gray-900 transition-colors">
                                        AI Content Lab                                        
                                      </button>

                                      {isOpen && (
                                        <div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md z-10 flex flex-col">
                                          
                                          <Link to="/ContentGenerationFlow"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)} // close dropdown after click
                                          >
                                            Facebook Optimizer
                                          </Link>

                                          <Link to="/ContentGenerationInstagram"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                          >
                                            Instagram Optimizer
                                          </Link>

                                          <Link to="/ContentGenerationSnapchat"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                          >
                                            Snapchat Optimizer
                                          </Link>

                                          <Link to="/ContentGenerationYouTube"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                          >
                                            Youtube Optimizer
                                          </Link>

                                          <Link to="/ContentGenerationTikTok"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                          >
                                            TikTok Optimizer
                                          </Link>

                                          <Link to="/ContentGenerationPinterest"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                          >
                                            Pinterest Optimizer
                                          </Link>

                                        </div>
                                      )}
                                    </div>

                            
                            <a href="#contact" onClick={() =>{goToContact(); setIsOpen(false);}} className="text-gray-600 hover:text-gray-900 transition-colors">
                                Contact
                            </a>
                            <a href="#" onClick={(e) =>{e.preventDefault(); checkForToken(); setIsOpen(false);}} className="text-gray-600 hover:text-gray-900 transition-colors">
                                Account
                            </a>
                        </nav>
                    </div>
                                      
                    <div className="md:flex items-center space-x-1">
                          {shouldShowButtons && (
                            <>
                              <Link to="/register">
                                <button className="md:flex px-5 py-2 rounded-md border border-teal-600 text-teal-800 hover:bg-teal-100 transition-colors">
                                  Register
                                </button>
                              </Link>
                              <Link to="/login">
                                <button className="md:flex px-5 py-2 rounded-md border border-teal-600 text-teal-800 hover:bg-teal-100 transition-colors">
                                  Login
                                </button>
                              </Link>
                            </>
                          )}
                        </div>




                {/* Mobile hamburger */}
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 focus:outline-none text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg z-20 flex flex-col items-start space-y-2 px-6 py-4 md:hidden">
          <a href="#features" onClick={() => { goToFeatures(); setMobileMenuOpen(false); }}>Features</a>
          <a href="#about" onClick={() => { goToAbout(); setMobileMenuOpen(false); }}>About</a>
          <a href="#contact" onClick={() => { goToContact(); setMobileMenuOpen(false); }}>Contact</a>
          <a href="#" onClick={(e) => { e.preventDefault(); checkForToken(); setMobileMenuOpen(false); }}>Account</a>

          <details className="w-full">
            <summary className="cursor-pointer py-2 text-gray-700">AI Content Lab</summary>
            <div className="flex flex-col space-y-1 pl-4">
              <Link to="/ContentGenerationFlow" onClick={() => setMobileMenuOpen(false)}>Facebook Optimizer</Link>
              <Link to="/ContentGenerationInstagram" onClick={() => setMobileMenuOpen(false)}>Instagram Optimizer</Link>
              <Link to="/ContentGenerationSnapchat" onClick={() => setMobileMenuOpen(false)}>Snapchat Optimizer</Link>
              <Link to="/ContentGenerationYouTube" onClick={() => setMobileMenuOpen(false)}>YouTube Optimizer</Link>
              <Link to="/ContentGenerationTikTok" onClick={() => setMobileMenuOpen(false)}>TikTok Optimizer</Link>
              <Link to="/ContentGenerationPinterest" onClick={() => setMobileMenuOpen(false)}>Pinterest Optimizer</Link>
            </div>
          </details>
        </div>
      )}

                </header>

  );
};

export default Header;
