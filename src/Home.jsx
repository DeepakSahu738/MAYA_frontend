import {React, useState} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
export default function Home() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handdleSendMessageOnClick = async (event) => {
        console.log("Name: ", name);
        console.log("Email: ", email);
        console.log("Message: ", message);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        event.preventDefault(); // Prevent the default form submission behavior
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.');
            return;}
        try {
            const response = await axios.post('http://localhost:9090/contact/addContactMessages', {
              name,
              email,
              message,
            });
        
            console.log('Success:', response.data);
            toast.success('Thank you for contacting US , Your Message has been sent successfully!');
        
            // Reset form
            setName('');
            setEmail('');
            setMessage('');
          } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data || error.message);
                toast.error('Failed to send message. Please try again.');
              } else {
                console.error('Unexpected error:', error);
                toast.error('Failed to send message. Please try again.');
              }}
          
    }
    
    const handleSendNameChange = (e) => {
        setName(e.target.value);
    }
    const handleSendEmailChange = (e) => {
        setEmail(e.target.value);
    }
    const handleSendMessageChange = (e) => {
        setMessage(e.target.value);
    }


  return (
    <div id="home" className="pt-24 flex flex-col items-center px-6 py-12 space-y-24">
      {/* main Section */}
      <section className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl">
        <div className="flex-1 space-y-6 mr-24">
          <h1 className="text-4xl md:text-6xl font-bold text-black">
            Meet <span className="text-teal-600">MAYA</span>, Your <br />
            <span className="whitespace-nowrap">Personal</span>
             <span className="text-teal-600 whitespace-nowrap"> Social Mate</span>
          </h1>
          <p className="text-gray-600 text-lg">
          MAYA is your AI-powered assistant for social media success. It helps you generate tailored, 
          high-performing content ideas for every platform, and provides smart analytics to track performance. 
          Based on audience behavior and post insights, it recommends improvements so you can grow faster, 
          engage better, and stay ahead effortlessly.
          </p>
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">
              <a href="/login">
              Get Started
              </a>   
            </button>
            <button className="px-6 py-3 border border-gray-400 text-black rounded-lg font-semibold hover:bg-gray-300">
              <a href="#about">Learn More</a>
            </button>
          </div>
        </div>

        <div className="flex-1 mt-10 ml-24 md:mt-0">
          <img
            src="/mayadashboard.png"
            alt="Dashboard Screenshot"
            className="rounded-xl shadow-xl w-96 h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="pt-24 flex flex-col items-center w-full max-w-5xl text-center space-y-12">
          <div className="bg-white py-0 md:py-0 w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                      <p className="uppercase tracking-wide font-semibold text-teal-600">FEATURES</p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                          Everything you need in one place
                      </h2>
                      <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                          MAYA combines powerful features to help you manage your personal and professional life effortlessly.
                      </p>
                  </div>
                  <div className="space-y-16">
                      <div className="space-y-6">
                          <h3 className="text-2xl border-l-4 border-teal-400 pl-3 text-left">Live Features</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-16">
                              <div className="flex items-start space-x-6 group transition-all duration-300 hover:translate-y-[-5px]">
                                  <div className="flex-shrink-0">
                                      <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center transition-all duration-300 group-hover:bg-teal-100">
                                          <span className="material-symbols-outlined text-teal-600 text-xl">psychology</span>
                                      </div>
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-medium text-gray-900 mb-2 transition-colors duration-300 text-left">
                                          AI-Powered Intelligence
                                      </h3>
                                      <p className="text-gray-600 text-left">
                                          MAYA adjust to your preferences to provide personalized AI Powered recommendations.
                                      </p>
                                  </div>
                              </div>

                              <div className="flex items-start space-x-6 group transition-all duration-300 hover:translate-y-[-5px]">
                                  <div className="flex-shrink-0">
                                      <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center transition-all duration-300 group-hover:bg-teal-100">
                                          <span className="material-symbols-outlined text-teal-600 text-xl">
                                                public
                                          </span>
                                      </div>
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-medium text-gray-900 mb-2 transition-colors duration-300 text-left">
                                          Platforms Supported
                                      </h3>
                                      <p className="text-gray-600 text-left">
                                      Supports all major platforms: Instagram, Facebook, TikTok, YouTube, Pinterest, and Snapchat - optimized content tailored for each.
                                      </p>
                                  </div>
                              </div>

                              <div className="flex items-start space-x-6 group transition-all duration-300 hover:translate-y-[-5px]">
                                  <div className="flex-shrink-0">
                                      <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center transition-all duration-300 group-hover:bg-teal-100">
                                          <span className="material-symbols-outlined text-teal-600 text-xl">auto_awesome</span>
                                      </div>
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-medium text-gray-900 mb-2 transition-colors duration-300 text-left">
                                          Content Generator Tool
                                      </h3>
                                      <p className="text-gray-600 text-left">
                                          Create engaging and relevant content ideas with our AI-powered generator that adapts to your
                                          brand voice and style preferences.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-8">
                          <h3 className="text-2xl text-gray-900 border-l-4 border-teal-400 pl-3 text-left">Coming Soon</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-16">
                              <div className="flex items-start space-x-6 group transition-all duration-300 hover:translate-y-[-5px] hover:bg-teal-50/30 p-4 rounded-lg">
                                  <div className="flex-shrink-0">
                                      <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center transition-all duration-300 group-hover:bg-teal-100 group-hover:scale-110">
                                          <span className="material-symbols-outlined text-teal-600 text-xl">analytics</span>
                                      </div>
                                  </div>
                                  <div>
                                      <div className="flex items-center">
                                          <h3 className="text-xl font-medium text-gray-900 mb-2 transition-colors duration-300">
                                              Social Media Analytics
                                          </h3>
                                          <span className="ml-2 text-xs font-semibold text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">
                                              Coming Q4 2025
                                          </span>
                                      </div>
                                      <p className="text-gray-600 text-left">
                                          Connect your social media accounts to receive comprehensive analytics and AI-driven
                                          suggestions to improve your online presence and engagement.
                                      </p>
                                      <div className="mt-4 inline-flex items-center text-teal-600 font-medium group-hover:text-teal-700 cursor-pointer">
                                          <span>Learn more</span>
                                          <span className="material-symbols-outlined ml-1 text-sm transition-transform group-hover:translate-x-1">
                                              arrow_forward
                                          </span>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-gradient-to-br from-teal-100 to-gray-50 p-7 rounded-xl border border-teal-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                  <div className="flex items-center mb-4">
                                      <span className="material-symbols-outlined text-teal-600 mr-2">tips_and_updates</span>
                                      <h3 className="text-xl font-bold text-gray-900">How It Will Work</h3>
                                  </div>
                                  <ol className="space-y-4 text-gray-600">
                                      <li className="flex items-start bg-white bg-opacity-70 p-3 rounded-lg transition-all duration-200 hover:bg-teal-50">
                                          <span className="bg-teal-100 text-teal-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 shadow-sm">
                                              1
                                          </span>
                                          <p className="mt-0.5">
                                              Simply connect your social media accounts or provide your user ID
                                          </p>
                                      </li>
                                      <li className="flex items-start bg-white bg-opacity-70 p-3 rounded-lg transition-all duration-200 hover:bg-teal-50">
                                          <span className="bg-teal-100 text-teal-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 shadow-sm">
                                              2
                                          </span>
                                          <p className="mt-0.5">
                                              Our AI will analyze your content performance and audience engagement
                                          </p>
                                      </li>
                                      <li className="flex items-start bg-white bg-opacity-70 p-3 rounded-lg transition-all duration-200 hover:bg-teal-50">
                                          <span className="bg-teal-100 text-teal-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 shadow-sm">
                                              3
                                          </span>
                                          <p className="mt-0.5">
                                              Receive tailored recommendations to improve your social media strategy
                                          </p>
                                      </li>
                                  </ol>
                                  <div className="mt-5 text-xs text-teal-600 italic text-right">
                                      * Beta access will be available to logged in users first
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="pt-24 flex flex-col items-center w-full max-w-5xl text-center space-y-12">
          <div>
            <h3 className="text-teal-600 font-semibold">ABOUT US</h3>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Who We Are
            </h2>
            <p className="text-gray-600 mt-4">
            We are a team of passionate developers and designers dedicated to creating innovative solutions that enhance productivity and simplify daily tasks.
            Our goal is to build tools that are not only functional but also easy to use and enjoyable. We value clean design, efficient code, and user-friendly experiences.
            Driven by creativity and collaboration, we’re committed to making a positive impact through technology.
            </p>
          </div>
          </section>

        {/* Contact Section */} 
        <section id="contact" className="pt-24 flex flex-col items-center w-full max-w-5xl text-center space-y-12">
        <div>
            <h3 className="text-teal-600 font-semibold">CONTACT US</h3>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Get in Touch
            </h2>
            <p className="text-gray-600 mt-4">
            Have questions or feedback? We'd love to hear from you! Reach out to us anytime.
            </p>
        </div>
        <form className="mt-8 space-y-6 w-full max-w-md" id = "contact-form" onSubmit={handdleSendMessageOnClick}>
            <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={handleSendNameChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
            />
            <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={handleSendEmailChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
            />
            <textarea
            rows="4"
            placeholder="Your Message"
            value={message}
            onChange={handleSendMessageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
            ></textarea>
            <button className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
            type="submit">
            Send Message
            </button>   
            </form>
        </section>
        
    </div>
  );
}
