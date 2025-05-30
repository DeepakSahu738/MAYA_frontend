import React from "react"
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ContentGenenrationFlow(){


    const [keywords, setKeywords] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
            e.preventDefault();
            const newKeyword = inputValue.trim().replace(/,$/, '');
            if (!keywords.includes(newKeyword)) {
                setKeywords([...keywords, newKeyword]);
            }
            setInputValue('');
        }
    };

    const handleRemove = (indexToRemove) => {
        setKeywords(keywords.filter((_, index) => index !== indexToRemove));
    };

        const [formData, setFormData] = useState({
            postGoal: 'Engagement',
            NicheIndustry: 'Business',
            PostType: 'Video',
            ToneStyle: 'Humorous',
            ContentType: 'Evergreen',
            CTA: 'Visit Website',
            TargetAudiance: '18–24',
        });
    
        const [dropdowns, setDropdowns] = useState({
            postGoal: false,
            NicheIndustry: false,
            PostType: false,
            ToneStyle: false,
            ContentType: false,
            CTA: false,
            TargetAudiance: false,
            // you can add more dropdowns like contentType: false etc.
        });
    
        const handleDropdownToggle = (field) => {
            setDropdowns((prev) => ({ ...prev, [field]: !prev[field] }));
        };
    
        const handleSelect = (field, value) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setDropdowns((prev) => ({ ...prev, [field]: false }));
        };

        const [postIdeas, setPostIdeas] = useState([]);
        const [headlinesAndDes, setHeadlinesAndDes] = useState([]);
        const [features, setFeatures] = useState([]);
        const [hashtags, setHashtags] = useState([]);
        const [boostingTips, setBoostingTips] = useState([]);
        const [postingTimes, setPostingTimes] = useState([]);
        const [loading, setLoading] = useState(false);

        

        const handleGenerateResult =  async (e) => {
            e.preventDefault();
            // Handle the form submission logic here
            console.log("Form Data:", formData);
            console.log("Keywords:", keywords);
            setLoading(true); // Show loading spinner
            try {
                const response = await axios.post('http://localhost:9090/api/content/facebook/fb_prime', {
                    postGoal: formData.postGoal,
                    niche: formData.NicheIndustry,
                    postType: formData.PostType,
                    targetAudience: formData.TargetAudiance,
                    toneAndStyle: formData.ToneStyle,
                    contentType: formData.ContentType,
                    topicsAndKeywords: keywords,
                    callToAction: formData.CTA,
                });
            
                console.log('Success:', response.data);
                setPostIdeas(response.data.facebookData.postIdeasList.postIdeas);
                setHeadlinesAndDes(response.data.facebookData.headlinesAndDesList.headlinesAndDes);
                setFeatures(response.data.facebookData.engagementFeatureList.features);
                setHashtags(response.data.facebookData.hashtagsList.hashtags);
                setBoostingTips(response.data.facebookData.adAndBoostingList.boostingTips);
                setPostingTimes(response.data.facebookData.postingTimeList.postingTimes);
                setLoading(false); // Hide loading spinner
                toast.success('Your Recomendations has been successfully Generated!');
        
              } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error:', error.response?.data || error.message);
                    toast.error('Failed to Fetch Result. Please try again.');
                  } else {
                    console.error('Unexpected error:', error);
                    toast.error('Failed to Fetch Result. Please try again.');
                  }}
                  finally {
                    setLoading(false);
                  }
        };



    return (
        <div id="ContentGenerationFlow">
            <div className="min-h-screen bg-white font-sans lg:min-w-[1000px] pt-16">    
                {/* Main Content */}
                <main className="max-w-5xl mx-auto px-4 py-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="text-teal-600">Facebook Post</span>{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">
                                Optimizer
                            </span>


                            {/* Next: "Add animated underline effect on hover" */}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Create highly effective Facebook posts tailored to your specific needs and audience.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex mb-8">
                        <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-800 rounded-tl-md border-b-2 border-teal-500">
                            Input Parameters
                        </button>
                        <button className="flex-1 py-3 bg-white hover:bg-gray-50 transition-colors text-gray-800 rounded-tr-md border-b border-gray-200" onClick={() => document.getElementById('results').scrollIntoView({ behavior: 'smooth' })}>
                            Results
                        </button>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
                        <h2 className="text-xl font-bold mb-2">Enter Your Parameters</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Fill in the details below to get customized Facebook post recommendations.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Post Goal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Post Goal</label>
                                <div className="relative">
                                 <button
                                   onClick={() => handleDropdownToggle('postGoal')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.postGoal}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  
                        
                                {dropdowns.postGoal && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Engagement', 
                                              'Awareness',
                                              'Lead Generation',
                                              'Website Traffic', 
                                              'Conversions', 
                                              'Brand Loyalty', 
                                              'Community Building', 
                                              'Product Promotion', 
                                              'Event Promotion'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('postGoal', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                                
                                                </li>
                                                ))} 
                                        </ul>  
                                    </div> )}

                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    What do you want to achieve with this post?
                                </p>
                            </div>

                            {/* Niche/Industry */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Niche/Industry</label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('NicheIndustry')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.NicheIndustry}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  
                                    {dropdowns.NicheIndustry && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Business', 
                                              'News', 
                                              'Technology', 
                                              'Lifestyle', 
                                              'Health & Wellness', 
                                              'Finance', 
                                              'Education', 
                                              'Travel', 
                                              'Food & Beverage', 
                                              'Sports', 
                                              'Entertainment', 
                                              'Real Estate', 
                                              'Fashion & Beauty', 
                                              'Parenting', 
                                              'Non-Profit / Causes']
                                                .map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('NicheIndustry', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                </li>
                                                ))} 
                                        </ul> 
                                     </div> )}
 
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Which industry does your content relate to?
                                </p>
                            </div>

                            {/* Post Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('PostType')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.PostType}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  

                                    {dropdowns.PostType && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Text Post', 
                                              'Image Post', 
                                              'Video Post', 
                                              'Story', 
                                              'Live Stream', 
                                              'Link Post', 
                                              'Event', 
                                              'Poll / Question'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('PostType', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                </li>
                                                ))} 
                                        </ul> 
                                     </div> )}
 
                                </div>
                                <p className="mt-1 text-xs text-gray-500">What format will your post take?</p>
                            </div>

                            {/* Tone & Style */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tone & Style</label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('ToneStyle')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.ToneStyle}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  

                                    {dropdowns.ToneStyle && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Informative', 
                                              'Emotional', 
                                              'Storytelling', 
                                              'Relatable', 
                                              'Funny', 
                                              'Professional', 
                                              'Casual', 
                                              'Inspirational'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('ToneStyle', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                </li>
                                                ))} 
                                        </ul> 
                                     </div> )}
 
                                </div>
                                <p className="mt-1 text-xs text-gray-500">What tone should your content have?</p>
                            </div>

                            {/* Content Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('ContentType')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.ContentType}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  

                                    {dropdowns.ContentType && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Trending', 
                                              'Evergreen',
                                              'Mix of Both Trending and Evergreen'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('ContentType', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                </li>
                                                ))} 
                                        </ul> 
                                     </div> )}
 
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Trending (news-based) or Evergreen (timeless) content?
                                </p>
                            </div>

                            {/* Call-to-Action (CTA) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Call-to-Action (CTA)
                                </label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('CTA')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.CTA}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  

                                    {dropdowns.CTA && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Like', 
                                              'Share', 
                                              'Comment', 
                                              'Visit Website', 
                                              'Join Group', 
                                              'Sign Up', 
                                              'Send Message', 
                                              'Learn More', 
                                              'Shop Now', 
                                              'Watch More', 
                                              'RSVP'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('CTA', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                </li>
                                                ))} 
                                        </ul> 
                                     </div> )}
 
                                </div>
                                <p className="mt-1 text-xs text-gray-500">What action do you want users to take?</p>
                            </div>

                            {/* Target Audience */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('TargetAudiance')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.TargetAudiance}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  

                                    {dropdowns.TargetAudiance && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {[
                                                'Gen Z (13-24)',
                                                'Millennials (25-40)',
                                                'Gen X (41-56)',
                                                'Teenagers (13-19)',
                                                'Young Adults (20-29)',
                                                'Adults (30-45)',
                                                'Middle-aged Adults (45-60)',
                                                'Parents',
                                                'College Students',
                                                'Working Professionals',
                                                'Travel Enthusiasts',
                                                'Fitness Buffs',
                                                'Tech Lovers',
                                                'Fashion Enthusiasts',
                                                'Foodies'
                                                ].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('TargetAudiance', goal)}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {goal}
                                                </li>
                                                ))} 
                                        </ul> 
                                     </div> )}
 
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Who are you trying to reach with this post?
                                </p>
                            </div>

                            {/* Topics & Keywords */}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Topics & Keywords
                                </label>
                            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-gray-300 rounded-md min-h-[3rem]">
                                            {keywords.map((keyword, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm"
                                                >
                                                    {keyword}
                                                    <button
                                                        onClick={() => handleRemove(index)}
                                                        className="ml-2 text-teal-700 hover:text-red-500"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                            <input
                                                className="flex-grow focus:outline-none text-sm p-1 min-w-[120px]"
                                                placeholder="Type and press Enter or comma"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>
                          
                                <p className="mt-1 text-xs text-gray-500">What specific topics do you want to cover?</p>
                                <input type="hidden" name="keywords" value={JSON.stringify(keywords)} />
                           
                            </div>
                        </div>

                        <button className="w-full mt-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors transform hover:scale-[1.01] active:scale-[0.99]"
                            onClick={handleGenerateResult}>
                            Generate Recommendations
                        </button>
                    </div>

                    {/* Loading Spinner */}
                    {loading && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-teal-200">
                              <img
                                src="/MAYA_Panda_withoutBackground_withBase.png"
                                alt="Loading mascot"
                                className="w-48 h-48 mb-6 animate-pulse"
                              />
                              <p className="text-teal-700 text-xl font-semibold">
                                Generating your awesome content...
                              </p>
                            </div>
                          </div>
                            )}


                    {/* Results Section */}
                    <section id="results">
                    <div className="bg-white border border-gray-200 rounded-md mb-12">
                        <details className="group" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Post Ideas</h3>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </summary>
                            <div className="px-5 pb-5">
                                    {postIdeas.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Loading ideas...</p>
                                    ) : (
                                    <ul className="space-y-6">
                                        {postIdeas.map((idea, index) => (
                                        <li
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                                        >
                                            <div className="flex items-center mb-2">
                                            <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-sm font-medium flex items-center justify-center mr-3">
                                                {index + 1}
                                            </div>
                                            <h4 className="font-semibold text-md">{idea.postIdea}</h4>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                            <span className="font-medium text-gray-600">Script:</span> {idea.script}
                                            </p>
                                            <p className="text-sm text-gray-700 italic">
                                            <span className="font-medium not-italic text-gray-600">Why this works:</span>{' '}
                                            {idea.whyThisWorks}
                                            </p>
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
                        </details>

                        <details className="group border-t border-gray-200" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Optimized Headline & Description</h3>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </summary>
                            <div className="px-5 pb-5 space-y-6">
                            {headlinesAndDes.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No headlines found.</p>
                            ) : (
                                headlinesAndDes.map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                    <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Headline:</p>
                                    <p className="font-medium">{item.headlines}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                                    <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                                ))
                            )}
                            </div>
                        </details>

                        <details className="group border-t border-gray-200" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Suggested Hashtags & Tags</h3>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </summary>
                            <div className="px-5 pb-5">
                                <div className="flex flex-wrap gap-2">
                                    {hashtags.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No hashtags found.</p>
                                    ) : (
                                    hashtags.map((tag, index) => (
                                        <span
                                        key={index}
                                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm hover:bg-teal-100 transition-colors cursor-pointer"
                                        >
                                        {tag.hashtag}
                                        </span>
                                    ))
                                    )}
                                </div>
                                </div>
                        </details>

                        <details className="group border-t border-gray-200" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Engagement Features</h3>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </summary>
                            <div className="px-5 pb-5">
                                <ul className="space-y-4">
                                    {features.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No features found.</p>
                                    ) : (
                                    features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white font-medium text-sm mr-3">
                                            {index + 1}
                                        </div>
                                        <p className="pt-0.5">{feature.engagementFeatures}</p>
                                        </li>
                                    ))
                                    )}
                                </ul>
                                </div>
                        </details>

                        <details className="group border-t border-gray-200" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Ad Format & Boosting Tips</h3>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </summary>
                            <div className="px-5 pb-5 space-y-6">
                                {boostingTips.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No boosting tips found.</p>
                                ) : (
                                    boostingTips.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                        <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Recommended Ad Format:</p>
                                        <p className="font-medium">{item.adFormat}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Boosting Tips:</p>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                            <li>{item.boosting}</li>
                                        </ul>
                                        </div>
                                    </div>
                                    ))
                                )}
                                </div>
                        </details>

                        <details className="group border-t border-gray-200" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Best Posting Time</h3>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </summary>
                            <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {postingTimes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No posting times available.</p>
        ) : (
          postingTimes.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-500 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <p className="text-gray-700 text-sm">{item.postingTime}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
                        </details>
                    </div>
                    </section>
                </main>
            </div>
        </div>
    )
}
