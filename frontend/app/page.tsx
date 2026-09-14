export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Local SEO Platform
        </div>
        <nav className="flex gap-4">
          <a href="/login" className="px-4 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Log In</a>
          <a href="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">Get Started</a>
        </nav>
      </header>
      
      <main className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Dominate Your <span className="text-blue-500">Local Search</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-10">
          The ultimate platform for tracking rankings, managing reviews, and outperforming competitors in your local market.
        </p>
        <div className="flex gap-4">
          <a href="/register" className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
            Start Free Trial
          </a>
          <a href="/dashboard" className="px-8 py-4 text-lg font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 hover:border-slate-600">
            View Dashboard
          </a>
        </div>
      </main>
      
      <footer className="container mx-auto px-6 py-8 text-center text-slate-500 text-sm border-t border-slate-800">
        &copy; {new Date().getFullYear()} Local SEO Platform. All rights reserved.
      </footer>
    </div>
  );
}
