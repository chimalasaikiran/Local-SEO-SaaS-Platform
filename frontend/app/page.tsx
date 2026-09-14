import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LocentraLandingPage() {
    return (
        <div className="w-full min-h-screen flex justify-center bg-white font-sans text-slate-900">
            <div className="w-full relative bg-radial from-gray-300 from 7% to-gray-300/0 to 7% flex flex-col justify-between items-center overflow-x-hidden">
                <div className="w-full h-full absolute top-0 left-0 bg-radial-[at_50%_38%] from-emerald-500/10 via-emerald-100/30 via 35% to-emerald-100/0 to 70% pointer-events-none"></div>

                {/* Navigation */}
                <div className="w-full max-w-[1440px] px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center relative z-10 gap-4 md:gap-0">
                    <div className="flex justify-start items-center">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-emerald-200/80 flex justify-center items-center">
                            <img src="/assets/Icon.svg" alt="Locentra Logo" className="w-5 h-5 object-contain" />
                        </div>
                        <div className="pl-3 flex flex-col justify-start items-start">
                            <div className="flex justify-start items-center">
                                <div className="flex flex-col justify-start items-start">
                                    <div className="justify-center text-slate-900 text-xl font-extrabold leading-7 tracking-tight">Locentra</div>
                                </div>
                                <div className="pl-2 flex flex-col justify-start items-start">
                                    <div className="px-2 py-0.5 bg-emerald-50 rounded-md outline outline-1 outline-offset-[-1px] outline-emerald-200/60 flex flex-col justify-start items-start">
                                        <div className="justify-center text-emerald-700 text-xs font-semibold uppercase leading-4 tracking-wide">AI SEO</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                        <div className="justify-center text-slate-600 text-sm font-medium leading-5 cursor-pointer hover:text-slate-900 transition-colors">Features</div>
                        <div className="justify-center text-slate-600 text-sm font-medium leading-5 cursor-pointer hover:text-slate-900 transition-colors">Rank Tracker</div>
                        <div className="justify-center text-slate-600 text-sm font-medium leading-5 cursor-pointer hover:text-slate-900 transition-colors">Reviews</div>
                        <div className="justify-center text-slate-600 text-sm font-medium leading-5 cursor-pointer hover:text-slate-900 transition-colors">Pricing</div>
                        <Link href="/login" className="justify-center text-emerald-600 text-sm font-semibold leading-5 cursor-pointer hover:text-emerald-700 transition-colors ml-2 md:ml-4">Sign In</Link>
                        <Link href="/register" className="px-4 py-2 bg-emerald-600 rounded-lg shadow-sm flex flex-col justify-start items-start cursor-pointer hover:bg-emerald-700 transition-colors">
                            <div className="justify-center text-white text-sm font-semibold leading-5">Start Free Trial</div>
                        </Link>
                    </div>
                </div>

                <div className="w-full px-4 md:px-8 py-8 flex justify-center items-center relative z-10">
                    <div className="w-full max-w-[1440px] flex flex-col justify-start items-center gap-16 md:gap-24">

                        {/* Hero Section */}
                        <div className="w-full max-w-4xl pt-8 md:pt-12 flex flex-col justify-start items-center gap-6 text-center">
                            <div className="px-4 py-1.5 bg-emerald-50 rounded-full outline outline-1 outline-offset-[-1px] outline-emerald-200 flex justify-start items-center shadow-sm">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <div className="pl-2 flex flex-col justify-start items-start">
                                    <div className="text-center justify-center text-emerald-800 text-xs font-semibold leading-4">#1 Local SEO & Map Pack Automation Platform</div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col justify-start items-center">
                                <h1 className="text-center justify-center text-slate-900 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                                    Dominate Google Maps & Local <br className="hidden md:block" />3-Pack Rankings Automatically
                                </h1>
                            </div>
                            <div className="w-full max-w-2xl flex flex-col justify-start items-center">
                                <p className="text-center justify-center text-slate-600 text-base md:text-lg lg:text-xl font-normal leading-relaxed">
                                    Locentra's AI-powered engine optimizes your Google Business Profile, tracks geo-grid rankings, and automates reviews to drive high-intent local customers straight to your door.
                                </p>
                            </div>
                            <div className="w-full pt-4 flex flex-col md:flex-row justify-center items-center gap-4">
                                <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-emerald-600 rounded-xl shadow-[0px_8px_20px_0px_rgba(16,185,129,0.30)] flex justify-center items-center cursor-pointer hover:bg-emerald-700 transition-all hover:-translate-y-0.5">
                                    <div className="flex flex-col justify-start items-center">
                                        <span className="text-center justify-center text-white text-base font-bold leading-6">Start Free 14-Day Trial</span>
                                    </div>
                                    <img src="/assets/Icon (1).svg" className="w-5 h-5 ml-2 filter brightness-0 invert" alt="Arrow Right" />
                                </Link>
                                <div className="w-full md:w-auto px-8 py-4 bg-white rounded-xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-center cursor-pointer hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                                    <span className="text-center justify-center text-slate-700 text-base font-semibold leading-6">Watch 2-Min Demo</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div className="w-full flex flex-col justify-start items-center gap-6">
                            <div className="w-full flex flex-col justify-start items-center">
                                <div className="text-center justify-center text-slate-400 text-xs font-bold uppercase leading-4 tracking-wider">TRUSTED BY 44,000+ LOCAL BUSINESSES AND AGENCIES</div>
                            </div>
                            <div className="w-full opacity-70 flex flex-wrap justify-center items-center gap-8 md:gap-16">
                                <div className="flex flex-col justify-start items-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                                    <span className="text-center justify-center text-slate-700 text-lg md:text-xl font-extrabold leading-7">Apex Dental</span>
                                </div>
                                <div className="flex flex-col justify-start items-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                                    <span className="text-center justify-center text-slate-700 text-lg md:text-xl font-extrabold leading-7">Metro Plumbing</span>
                                </div>
                                <div className="flex flex-col justify-start items-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                                    <span className="text-center justify-center text-slate-700 text-lg md:text-xl font-extrabold leading-7">Summit Legal</span>
                                </div>
                                <div className="flex flex-col justify-start items-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                                    <span className="text-center justify-center text-slate-700 text-lg md:text-xl font-extrabold leading-7">Vanguard Realty</span>
                                </div>
                                <div className="flex flex-col justify-start items-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                                    <span className="text-center justify-center text-slate-700 text-lg md:text-xl font-extrabold leading-7">Pinnacle HVAC</span>
                                </div>
                            </div>
                        </div>

                        {/* Automation Features */}
                        <div className="w-full pt-4 flex flex-col justify-start items-center gap-12">
                            <div className="w-full max-w-3xl flex flex-col justify-start items-center gap-4 px-4 text-center">
                                <h2 className="justify-center text-slate-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Everything You Need to Rank #1 Locally</h2>
                                <p className="justify-center text-slate-600 text-lg md:text-xl font-normal leading-relaxed">Powerful automated modules designed to put your local SEO on complete autopilot.</p>
                            </div>
                            <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-8 px-4 md:px-0">
                                {/* Feature Card 1 */}
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-between items-start hover:shadow-md transition-shadow">
                                    <div className="w-full pb-6 flex flex-col justify-start items-start gap-3">
                                        <div className="px-3 py-1.5 bg-emerald-50 rounded-full flex justify-start items-center">
                                            <img src="/assets/SVG (1).svg" alt="Geo Grid" className="w-3.5 h-3.5" />
                                            <span className="pl-2 justify-center text-emerald-800 text-xs font-semibold leading-4">Geo-Grid Accuracy</span>
                                        </div>
                                        <h3 className="w-full pt-2 justify-start text-slate-900 text-xl font-bold leading-7">Advanced Rank Tracking</h3>
                                        <p className="w-full justify-start text-slate-600 text-sm md:text-base font-normal leading-relaxed">
                                            See your precise map rankings across 9, 25, or 49-point geo-grids down to the exact street corner.
                                        </p>
                                    </div>
                                    <div className="w-full p-4 bg-emerald-50/50 rounded-xl outline outline-1 outline-offset-[-1px] outline-emerald-100 flex justify-between items-center">
                                        <span className="justify-center text-emerald-900 text-sm font-semibold leading-5">Average Grid Rank: #1.4</span>
                                        <div className="px-2.5 py-1 bg-emerald-600 rounded-lg flex flex-col justify-start items-start">
                                            <span className="justify-center text-white text-xs font-bold leading-4">+4.2 vs last month</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Feature Card 2 */}
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-between items-start hover:shadow-md transition-shadow">
                                    <div className="w-full pb-6 flex flex-col justify-start items-start gap-3">
                                        <div className="px-3 py-1.5 bg-emerald-50 rounded-full flex justify-start items-center">
                                            <img src="/assets/Icon (2).svg" alt="Sentiment Engine" className="w-3.5 h-3.5" />
                                            <span className="pl-2 justify-center text-emerald-800 text-xs font-semibold leading-4">AI Sentiment Engine</span>
                                        </div>
                                        <h3 className="w-full pt-2 justify-start text-slate-900 text-xl font-bold leading-7">Automated Review Responses</h3>
                                        <p className="w-full justify-start text-slate-600 text-sm md:text-base font-normal leading-relaxed">
                                            Context-aware AI replies to customer reviews instantly, boosting trust and signaling local relevance.
                                        </p>
                                    </div>
                                    <div className="w-full p-4 bg-emerald-50/50 rounded-xl outline outline-1 outline-offset-[-1px] outline-emerald-100 flex justify-between items-center">
                                        <span className="justify-center text-emerald-900 text-sm font-semibold leading-5">5-Star Sentiment Rating</span>
                                        <div className="px-2.5 py-1 bg-emerald-600 rounded-lg flex flex-col justify-start items-start">
                                            <span className="justify-center text-white text-xs font-bold leading-4">4.9 / 5.0 (420+ reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Geo-Grid Intelligence Section */}
                        <div className="w-full px-6 md:px-12 pt-16 pb-12 relative bg-emerald-900 rounded-3xl shadow-xl flex flex-col justify-start items-start overflow-hidden">
                            <div className="w-full h-full left-0 top-0 absolute opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                            <div className="w-full flex flex-col lg:flex-row justify-center items-center gap-12 relative z-10">
                                <div className="flex-1 pt-0.5 flex flex-col justify-start items-start gap-6">
                                    <div className="px-3 py-1.5 bg-emerald-800/80 rounded-full flex justify-start items-start backdrop-blur-sm">
                                        <span className="justify-center text-emerald-300 text-xs font-bold uppercase leading-4 tracking-wide">GEO-GRID INTELLIGENCE</span>
                                    </div>
                                    <h2 className="w-full justify-start text-white text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                                        Precision Rank Tracking Across Every Street Corner
                                    </h2>
                                    <p className="w-full justify-start text-emerald-100 text-base md:text-lg font-normal leading-relaxed">
                                        Traditional rank trackers only show your rank from a single central point. Locentra uses multi-point geo-grids (9, 25, or 49 pins) to show your exact visibility block-by-block across your entire target service area.
                                    </p>
                                    <div className="w-full py-2 flex flex-col justify-start items-start gap-4">
                                        <div className="w-full flex justify-start items-center">
                                            <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-inner">
                                                <img src="/assets/Icon (7).svg" className="w-3 h-3 text-emerald-900" alt="Check" />
                                            </div>
                                            <span className="pl-3 justify-center text-white text-sm md:text-base font-normal leading-5">Simulated local consumer search queries</span>
                                        </div>
                                        <div className="w-full flex justify-start items-center">
                                            <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-inner">
                                                <img src="/assets/Icon (7).svg" className="w-3 h-3 text-emerald-900" alt="Check" />
                                            </div>
                                            <span className="pl-3 justify-center text-white text-sm md:text-base font-normal leading-5">Automated weekly & daily tracking schedules</span>
                                        </div>
                                        <div className="w-full flex justify-start items-center">
                                            <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-inner">
                                                <img src="/assets/Icon (7).svg" className="w-3 h-3 text-emerald-900" alt="Check" />
                                            </div>
                                            <span className="pl-3 justify-center text-white text-sm md:text-base font-normal leading-5">Competitor map overlay and share of voice</span>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 mt-2 bg-emerald-500 rounded-xl flex justify-start items-center shadow-lg hover:bg-emerald-400 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                        <span className="justify-center text-white text-sm md:text-base font-bold leading-5">Explore Rank Tracker</span>
                                    </button>
                                </div>
                                <div className="w-full lg:flex-1 p-6 bg-white/10 rounded-2xl outline outline-1 outline-offset-[-1px] outline-emerald-700/50 backdrop-blur-md flex flex-col justify-start items-start">
                                    <div className="w-full p-6 bg-white rounded-xl shadow-[inset_0px_2px_8px_0px_rgba(0,0,0,0.05)] flex flex-col justify-start items-start gap-6">
                                        <div className="w-full flex justify-between items-center">
                                            <span className="text-center justify-center text-slate-900 text-sm md:text-base font-bold leading-5">Geo-Grid Coverage Map</span>
                                            <div className="px-3 py-1.5 bg-emerald-50 rounded-md flex flex-col justify-start items-center">
                                                <span className="text-center justify-center text-emerald-700 text-xs font-bold leading-4">Radius: 10 Miles</span>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-3 gap-3 md:gap-4 p-2">
                                            <div className="p-4 bg-emerald-600 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#1</span>
                                            </div>
                                            <div className="p-4 bg-emerald-500 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#2</span>
                                            </div>
                                            <div className="p-4 bg-emerald-100 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-slate-800 text-lg font-bold leading-5">#4</span>
                                            </div>
                                            <div className="p-4 bg-emerald-600 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#1</span>
                                            </div>
                                            <div className="p-4 bg-emerald-700 rounded-xl shadow-sm flex flex-col justify-center items-center ring-4 ring-emerald-200 hover:scale-105 transition-transform cursor-crosshair relative">
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#1</span>
                                            </div>
                                            <div className="p-4 bg-emerald-500 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#3</span>
                                            </div>
                                            <div className="p-4 bg-emerald-400 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#2</span>
                                            </div>
                                            <div className="p-4 bg-emerald-500 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-white text-lg font-bold leading-5">#2</span>
                                            </div>
                                            <div className="p-4 bg-emerald-200 rounded-xl shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-crosshair">
                                                <span className="text-center justify-center text-slate-800 text-lg font-bold leading-5">#5</span>
                                            </div>
                                        </div>
                                        <div className="w-full flex flex-col justify-start items-center pt-2">
                                            <span className="text-center justify-center text-slate-500 text-xs md:text-sm font-normal leading-4">Showing 9-point grid analysis for primary keyword "Dentist Near Me"</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reputation Management */}
                        <div className="w-full pt-8 flex flex-col justify-start items-center gap-12">
                            <div className="w-full max-w-3xl pt-0.5 flex flex-col justify-start items-center gap-4 px-4 text-center">
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-full flex justify-center items-start">
                                    <span className="text-center justify-center text-emerald-800 text-xs font-bold uppercase leading-4 tracking-wide">REPUTATION MANAGEMENT</span>
                                </div>
                                <h2 className="w-full justify-center text-slate-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Automated Google Reviews & AI Sentiment Replies</h2>
                                <p className="w-full justify-center text-slate-600 text-lg md:text-xl font-normal leading-relaxed">
                                    Collect 4x more 5-star reviews effortlessly while our AI responds instantly with context-aware, keyword-optimized gratitude.
                                </p>
                            </div>
                            <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-6 px-4 md:px-0">
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-4 hover:shadow-md transition-all hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex justify-center items-center">
                                        <img src="/assets/Icon (3).svg" className="w-6 h-6 text-emerald-600" alt="SMS" />
                                    </div>
                                    <h3 className="w-full justify-start text-slate-900 text-xl font-bold leading-7">Smart SMS & Email Blasts</h3>
                                    <p className="w-full justify-start text-slate-500 text-sm md:text-base font-normal leading-relaxed">
                                        Automated review requests sent right after customer service interactions for maximum conversion.
                                    </p>
                                </div>
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-4 hover:shadow-md transition-all hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex justify-center items-center">
                                        <img src="/assets/Icon (4).svg" className="w-6 h-6 text-emerald-600" alt="AI Reply" />
                                    </div>
                                    <h3 className="w-full justify-start text-slate-900 text-xl font-bold leading-7">Instant AI Response</h3>
                                    <p className="w-full justify-start text-slate-500 text-sm md:text-base font-normal leading-relaxed">
                                        Personalized replies that naturally integrate local keywords and express genuine appreciation.
                                    </p>
                                </div>
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-4 hover:shadow-md transition-all hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex justify-center items-center">
                                        <img src="/assets/Icon (5).svg" className="w-6 h-6 text-emerald-600" alt="Filter" />
                                    </div>
                                    <h3 className="w-full justify-start text-slate-900 text-xl font-bold leading-7">Negative Review Filter</h3>
                                    <p className="w-full justify-start text-slate-500 text-sm md:text-base font-normal leading-relaxed">
                                        Intercept dissatisfied customers internally before they impact your public Google star rating.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing section */}
                        <div className="w-full pt-8 flex flex-col justify-start items-center gap-12">
                            <div className="w-full max-w-3xl pt-0.5 flex flex-col justify-start items-center gap-4 px-4 text-center">
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-full flex justify-center items-start">
                                    <span className="text-center justify-center text-emerald-800 text-xs font-bold uppercase leading-4 tracking-wide">TRANSPARENT PRICING</span>
                                </div>
                                <h2 className="w-full justify-center text-slate-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Simple Plans Built for Local Growth</h2>
                                <p className="w-full justify-center text-slate-600 text-lg md:text-xl font-normal leading-relaxed">
                                    Start your 14-day free trial. No credit card required. Upgrade or cancel anytime.
                                </p>
                            </div>
                            <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-8 px-4 md:px-0">
                                {/* Starter */}
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-3xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-between items-start hover:shadow-lg transition-all">
                                    <div className="w-full pb-8 flex flex-col justify-start items-start gap-6">
                                        <div className="w-full flex flex-col justify-start items-start gap-2">
                                            <span className="justify-center text-emerald-600 text-xs font-bold uppercase leading-4 tracking-wider">STARTER</span>
                                            <div className="flex items-end gap-1">
                                                <span className="justify-center text-slate-900 text-4xl md:text-5xl font-extrabold tracking-tight">$49</span>
                                                <span className="justify-center text-slate-500 text-base font-medium pb-1.5">/mo</span>
                                            </div>
                                        </div>
                                        <p className="w-full justify-start text-slate-600 text-sm md:text-base font-normal leading-relaxed">
                                            Perfect for single-location local businesses looking to dominate map packs.
                                        </p>
                                        <div className="w-full pt-2 flex flex-col justify-start items-start gap-4">
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">1 Google Business Profile</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Weekly 9-point Geo-Grid</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">AI Review Responses</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3 opacity-50">
                                                <div className="w-4 h-4 mt-0.5 flex justify-center items-center"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div></div>
                                                <span className="justify-center text-slate-400 text-base font-normal leading-5">GBP Post Automation</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/register" className="w-full py-4 bg-slate-100 rounded-xl flex justify-center items-center hover:bg-slate-200 transition-colors mt-auto font-semibold">
                                        Start Free Trial
                                    </Link>
                                </div>
                                {/* Pro */}
                                <div className="flex-1 p-6 md:p-8 relative bg-white rounded-3xl outline outline-2 outline-offset-[-2px] outline-emerald-600 flex flex-col justify-between items-start shadow-xl lg:-translate-y-4">
                                    <div className="px-4 py-1.5 absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 rounded-full flex justify-center items-center shadow-md">
                                        <span className="justify-center text-white text-xs font-bold uppercase leading-4 tracking-wider whitespace-nowrap">MOST POPULAR</span>
                                    </div>
                                    <div className="w-full pb-8 flex flex-col justify-start items-start gap-6">
                                        <div className="w-full pt-1.5 flex flex-col justify-start items-start gap-2">
                                            <span className="justify-center text-emerald-600 text-xs font-bold uppercase leading-4 tracking-wider">PRO AGENCY</span>
                                            <div className="flex items-end gap-1">
                                                <span className="justify-center text-slate-900 text-4xl md:text-5xl font-extrabold tracking-tight">$99</span>
                                                <span className="justify-center text-slate-500 text-base font-medium pb-1.5">/mo</span>
                                            </div>
                                        </div>
                                        <p className="w-full justify-start text-slate-600 text-sm md:text-base font-normal leading-relaxed">
                                            Ideal for multi-location businesses and growing local marketing agencies.
                                        </p>
                                        <div className="w-full pt-2 flex flex-col justify-start items-start gap-4">
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Up to 5 Business Profiles</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Daily 25 & 49-point Grids</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Advanced AI Sentiment</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">GBP Post Automation</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/register" className="w-full py-4 bg-emerald-600 rounded-xl flex justify-center items-center hover:bg-emerald-700 transition-colors mt-auto shadow-md">
                                        <span className="text-white font-bold text-base">Start Free Trial</span>
                                    </Link>
                                </div>
                                {/* Enterprise */}
                                <div className="flex-1 p-6 md:p-8 bg-white rounded-3xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-between items-start hover:shadow-lg transition-all">
                                    <div className="w-full pb-8 flex flex-col justify-start items-start gap-6">
                                        <div className="w-full pt-1.5 flex flex-col justify-start items-start gap-2">
                                            <span className="justify-center text-emerald-600 text-xs font-bold uppercase leading-4 tracking-wider">ENTERPRISE</span>
                                            <div className="flex items-end gap-1">
                                                <span className="justify-center text-slate-900 text-4xl md:text-5xl font-extrabold tracking-tight">$249</span>
                                                <span className="justify-center text-slate-500 text-base font-medium pb-1.5">/mo</span>
                                            </div>
                                        </div>
                                        <p className="w-full justify-start text-slate-600 text-sm md:text-base font-normal leading-relaxed">
                                            For franchises and agencies managing dozens of local brand listings.
                                        </p>
                                        <div className="w-full pt-2 flex flex-col justify-start items-start gap-4">
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Unlimited Profiles</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Custom API & White-label</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Dedicated Account Manager</span>
                                            </div>
                                            <div className="w-full flex justify-start items-start gap-3">
                                                <img src="/assets/Icon (7).svg" className="w-4 h-4 mt-0.5 text-emerald-600" alt="Included" />
                                                <span className="justify-center text-slate-700 text-base font-medium leading-5">Priority 24/7 Support</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/register" className="w-full py-4 bg-slate-100 rounded-xl flex justify-center items-center hover:bg-slate-200 transition-colors mt-auto font-semibold">
                                        Contact Sales
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="w-full max-w-4xl pt-16 flex flex-col justify-start items-center gap-12 px-4 md:px-0">
                            <div className="w-full flex flex-col justify-start items-center gap-4 text-center">
                                <h2 className="justify-center text-slate-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Frequently Asked Questions</h2>
                                <p className="justify-center text-slate-600 text-lg font-normal leading-relaxed">Everything you need to know about Locentra.</p>
                            </div>
                            <div className="w-full flex flex-col justify-start items-start gap-6">
                                <div className="w-full p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-3 hover:shadow-md transition-shadow cursor-pointer">
                                    <h3 className="w-full justify-start text-slate-900 text-lg font-bold leading-6">How does the 14-day free trial work?</h3>
                                    <p className="w-full justify-start text-slate-600 text-base font-normal leading-relaxed">
                                        You get full, unrestricted access to all Locentra features for 14 days. No credit card is required to start.
                                    </p>
                                </div>
                                <div className="w-full p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-3 hover:shadow-md transition-shadow cursor-pointer">
                                    <h3 className="w-full justify-start text-slate-900 text-lg font-bold leading-6">Can I track multiple business locations?</h3>
                                    <p className="w-full justify-start text-slate-600 text-base font-normal leading-relaxed">
                                        Yes! Our Pro and Enterprise tiers are specifically designed to scale across multiple locations and client portfolios.
                                    </p>
                                </div>
                                <div className="w-full p-6 md:p-8 bg-white rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-3 hover:shadow-md transition-shadow cursor-pointer">
                                    <h3 className="w-full justify-start text-slate-900 text-lg font-bold leading-6">How do automated AI review responses work?</h3>
                                    <p className="w-full justify-start text-slate-600 text-base font-normal leading-relaxed">
                                        Locentra connects securely to your Google Business Profile, detects new reviews instantly, and drafts or auto-posts polite, optimized replies.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="w-full px-6 md:px-12 pt-16 pb-16 relative bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl flex flex-col justify-start items-center gap-8 shadow-xl overflow-hidden mt-8">
                            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                            <div className="w-full flex flex-col justify-start items-center relative z-10 text-center gap-4">
                                <h2 className="justify-center text-white text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">Ready to Dominate Your Local Map Pack?</h2>
                                <p className="w-full max-w-2xl justify-center text-emerald-100 text-lg md:text-xl font-normal leading-relaxed">
                                    Join over 44,000 local businesses using Locentra to automate their Google SEO and drive continuous inbound leads.
                                </p>
                            </div>
                            <Link href="/register" className="px-10 py-5 bg-white rounded-xl shadow-lg flex justify-center items-center hover:bg-slate-50 hover:scale-105 transition-all relative z-10 group">
                                <span className="justify-center text-emerald-700 text-lg font-bold leading-6">Start Your Free 14-Day Trial</span>
                                <img src="/assets/Icon (1).svg" className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" alt="Arrow Right" />
                            </Link>
                        </div>

                        {/* Footer links */}
                        <div className="w-full max-w-[1440px] pt-12 pb-6 flex flex-col md:flex-row justify-between items-center border-t border-slate-200 mt-8 gap-4 text-center md:text-left">
                            <div className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Locentra AI SEO. All rights reserved.</div>
                            <div className="flex gap-6">
                                <a href="#" className="text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">Privacy Policy</a>
                                <a href="#" className="text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">Terms of Service</a>
                                <a href="#" className="text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">Contact</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
