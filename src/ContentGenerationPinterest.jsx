import React from "react"
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ContentGenerationPinterest(){

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
            PinGoal: 'Drive Website Traffic',
            NicheIndustry: 'DIY & Crafts',
            PinType: 'Single Image Pin',
            ToneStyle: 'Clean & Aesthetic',
            ContentType: 'Evergreen',
            CTA: 'Save This Idea',
            TargetAudiance: 'Millennial Women (25–40)',
        });
    
        const [dropdowns, setDropdowns] = useState({
            PinGoal: false,
            NicheIndustry: false,
            PinType: false,
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
        const [pinIdeas, setPinIdeas] = useState([]);
                                                const [titleAndDescriptions, setTitleAndDescriptions] = useState([]);
                                                const [hashtags, setHashtags] = useState([]);
                                                const [aestheticAndDesigns, setAestheticAndDesigns] = useState([]);
                                                const [engagements, setEngagements] = useState([]);
                                                const [postingTimes, setPostingTimes] = useState([]);

        const [loading, setLoading] = useState(false);

        const handleGenerateResult =  async (e) => {
            e.preventDefault();
            // Handle the form submission logic here
            console.log("Form Data:", formData);
            console.log("Keywords:", keywords);
            setLoading(true); // Show loading spinner
            try {
                const response = await axios.post('http://localhost:9090/api/content/pinterest/pin_prime', {
                    pinGoal: formData.PinGoal,
                    niche: formData.NicheIndustry,
                    pinType: formData.PinType,
                    targetAudience: formData.TargetAudiance,
                    toneAndStyle: formData.ToneStyle,
                    contentType: formData.ContentType,
                    searchKeywords: keywords,
                    callToAction: formData.CTA,
                });
            
                console.log('Success:', response.data);
                setPinIdeas(response.data.PinIdeasData.pinIdeaList.pinIdeas || []);
                setTitleAndDescriptions(response.data.PinIdeasData.titleAndDescriptionList.titleAndDescriptions || []);
                setHashtags(response.data.PinIdeasData.hashtagList.hashtags || []);
                setAestheticAndDesigns(response.data.PinIdeasData.aestheticAndDesignList.aestheticAndDesigns || []);
                setEngagements(response.data.PinIdeasData.engagementList.engagements || []);
                setPostingTimes(response.data.PinIdeasData.postingTimeList.postingTimes || []);

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
        <div id="ContentGenerationPinterest">
            <div className="min-h-screen bg-white font-sans lg:min-w-[1000px] pt-16">    
                {/* Main Content */}
                <main className="max-w-5xl mx-auto px-4 py-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="text-teal-600">Pinterest Post</span>{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-400 to-rose-300">
  Optimizer
</span>



                            {/* Next: "Add animated underline effect on hover" */}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Create highly effective Pinterest posts tailored to your specific needs and audience.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex mb-8">
                        <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-800 rounded-tl-md border-b-2 border-teal-500">
                            Input Parameters
                        </button>
                        <button className="flex-1 py-3 bg-white hover:bg-gray-50 transition-colors text-gray-800 rounded-tr-md border-b border-gray-200">
                            Results
                        </button>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
                        <h2 className="text-xl font-bold mb-2">Enter Your Parameters</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Fill in the details below to get customized Pinterest post recommendations.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Pin Goal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pin Goal</label>
                                <div className="relative">
                                 <button
                                   onClick={() => handleDropdownToggle('PinGoal')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.PinGoal}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  
                        
                                {dropdowns.PinGoal && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Drive Website Traffic', 
                                              'Get Saves & Re-Pins', 
                                              'Build Brand Presence', 
                                              'Promote Affiliate Links', 
                                              'Inspire DIY Projects', 
                                              'Grow Email List'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('PinGoal', goal)}
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
                                            {['Home Decor', 
                                              'DIY & Crafts', 
                                              'Beauty & Skincare', 
                                              'Fitness Routines', 
                                              'Fashion & Outfits', 
                                              'Wedding Planning', 
                                              'Meal Prep & Recipes', 
                                              'Parenting Tips', 
                                              'Digital Products', 
                                              'Small Business'].map((goal) => (
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

                            {/* Pin Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pin Type</label>
                                <div className="relative">
                                <button
                                   onClick={() => handleDropdownToggle('PinType')}
                                   className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-800">{formData.PinType}</span>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>  

                                    {dropdowns.PinType && (
                                    <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1">
                                            {['Single Image Pin', 
                                              'Video Pin', 
                                              'Infographic / Guide', 
                                              'Carousel / Multi-Image Pin', 
                                              'Story Pin (Idea Pin)', 
                                              'Step-by-Step Tutorial Pin'].map((goal) => (
                                                <li
                                                key={goal}
                                                onClick={() => handleSelect('PinType', goal)}
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
                                            {['Clean & Aesthetic', 
                                              'Minimalist & Neutral', 
                                              'Step-by-Step Visual Guide', 
                                              'Bright & Bold', 
                                              'Elegant & Professional', 
                                              'Warm & Cozy', 
                                              'Infographic-Based'].map((goal) => (
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
                                            {['Click to Read More', 
                                              'Save This Idea', 
                                              'Shop Now', 
                                              'Download Freebie', 
                                              'Try This Look', 
                                              'Visit Website', 
                                              'Get the Recipe'].map((goal) => (
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
                                            {['Teens (13–19)', 
                                              'Gen Z (18–25)', 
                                              'Millennials (25–35)', 
                                              'Moms of TikTok', 
                                              'Small Business Owners', 
                                              'DIY Creators', 
                                              'Pet Lovers', 
                                              'Beauty Enthusiasts', 
                                              'Fitness Junkies'].map((goal) => (
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
                                      Search Keywords
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

                                <p className="mt-1 text-xs text-gray-500">What Search Keywords do you want to cover?</p>
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
                                    <h3 className="text-lg font-bold">Pin Ideas</h3>
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
                                    {pinIdeas.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Loading ideas...</p>
                                    ) : (
                                    <ul className="space-y-6">
                                        {pinIdeas.map((idea, index) => (
                                        <li
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                                        >
                                            <div className="flex items-center mb-2">
                                            <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-sm font-medium flex items-center justify-center mr-3">
                                                {index + 1}
                                            </div>
                                            <h4 className="font-semibold text-md">{idea.pinIdea}</h4>
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
                                    <h3 className="text-lg font-bold">Title And Descriptions</h3>
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
                                    {titleAndDescriptions.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Loading titles...</p>
                                    ) : (
                                        <ul className="space-y-6">
                                        {titleAndDescriptions.map((item, index) => (
                                            <li
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                                            >
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Headline:</p>
                                                <p className="font-medium">{item.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                                                <p className="text-gray-600">{item.description}</p>
                                            </div>
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
                                {hashtags.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Loading Hashtags...</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {hashtags.map((item, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm hover:bg-teal-100 transition-colors cursor-pointer"
                                            >
                                                {item.hashtag}
                                            </span>
                                        ))}
                                    </div>
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
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold">Aesthetic And Designs</h3>
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
                                    {aestheticAndDesigns?.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Loading design ideas...</p>
                                    ) : (
                                        <ul className="space-y-4">
                                        {aestheticAndDesigns.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white font-medium text-sm mr-3">
                                                {index + 1}
                                            </div>
                                            <p className="pt-0.5">
                                                <strong>{item.aesthetic}:</strong> {item.design}
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
                                    <h3 className="text-lg font-bold">Engagements Tips</h3>
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
                                    {engagements.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Loading engagement tactics...</p>
                                    ) : (
                                        <ul className="space-y-4">
                                        {engagements.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white font-medium text-sm mr-3">
                                                {index + 1}
                                            </div>
                                            <p className="pt-0.5">{item.engagementTips}</p>
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
                                {postingTimes.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Loading best times...</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {postingTimes.map((timeObj, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center mb-1">
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
                                                    <span className="text-sm font-medium text-gray-700">{timeObj.bestPostingTime}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>
                </main>
            </div>
        </div>
    )
}
