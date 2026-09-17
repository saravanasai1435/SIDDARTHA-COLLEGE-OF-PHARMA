
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isAdminMode?: boolean;
  onAdminToggle?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdminMode, onAdminToggle, isLoggedIn, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      <header className="sticky top-0 z-50 glass border-b border-emerald-100/80 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer group active:scale-98 transition-transform" 
            onClick={() => !isAdminMode ? window.location.reload() : onAdminToggle?.()}
          >
            <div className="border-l-2 border-emerald-500/80 pl-3 sm:pl-5">
              <span className="text-base sm:text-xl font-black text-emerald-900 block leading-none tracking-tight">
                KVSR SCOPS
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-[0.18em] whitespace-nowrap mt-1 block">
                Pharmacy Portal
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10 text-xs font-bold uppercase tracking-widest">
            <button 
              onClick={() => isAdminMode && onAdminToggle && onAdminToggle()}
              className={`transition-colors relative pb-1 ${!isAdminMode ? 'text-emerald-600' : 'text-emerald-800/60 hover:text-emerald-600'}`}
            >
              Academic Portal
              {!isAdminMode && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600"></div>}
            </button>
            <div className="flex items-center gap-3">
              <span className={`transition-colors text-xs font-bold ${isAdminMode ? 'text-emerald-600' : 'text-emerald-800/60'}`}>
                {isAdminMode ? 'Admin Active' : 'Faculty / Admin'}
              </span>
              <button 
                onClick={onAdminToggle}
                className="h-11 px-4 rounded-xl bg-emerald-100 flex items-center justify-center gap-2 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 active:scale-95 transition-all shadow-xs"
                title={isAdminMode ? "Switch to Academic Portal" : "Admin / Faculty Portal"}
              >
                <i className="fa-solid fa-user-shield text-base"></i>
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {isAdminMode ? 'Public View' : 'Admin'}
                </span>
              </button>
            </div>
          </nav>

          {/* Mobile Fast Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {isAdminMode ? (
              <button 
                onClick={onAdminToggle}
                className="h-10 px-3 rounded-xl bg-emerald-700 active:scale-95 text-white flex items-center gap-1.5 text-xs font-black shadow-sm"
              >
                <i className="fa-solid fa-arrow-left text-[11px]"></i>
                <span className="text-[10px] uppercase tracking-wider">Public View</span>
              </button>
            ) : (
              <button 
                onClick={onAdminToggle}
                className="h-10 px-3.5 rounded-xl bg-emerald-100 active:scale-95 text-emerald-900 border border-emerald-200 flex items-center gap-2 shadow-xs"
              >
                <i className="fa-solid fa-user-shield text-emerald-700 text-sm"></i>
                <span className="text-[10px] font-black uppercase tracking-wider">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {children}
      </main>

      <footer className="glass border-t border-emerald-100 py-8 sm:py-12 mt-12 sm:mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center mb-6">
             <img 
               src="https://kvsrsiddharthapharma.edu.in/images/logo_home.png" 
               alt="KVSR SCOPS Logo" 
               className="h-14 sm:h-20 w-auto object-contain mb-5 sm:mb-8 opacity-90 hover:opacity-100 transition-opacity"
               referrerPolicy="no-referrer"
             />
             <div className="w-12 h-1 bg-emerald-600 rounded-full mb-3 sm:mb-4"></div>
             <p className="text-emerald-900 font-black text-sm sm:text-lg uppercase tracking-tight px-2">
               K.V.S.R. Siddhartha College of Pharmaceutical Sciences
             </p>
             <p className="text-emerald-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] mt-1">
               Siddhartha Nagar, Vijayawada - 520010, A.P.
             </p>
          </div>
          
          <div className="flex justify-center gap-8 mb-6 sm:mb-8 text-emerald-600">
            <i className="fa-solid fa-flask hover:text-emerald-800 cursor-pointer text-base sm:text-lg"></i>
            <i className="fa-solid fa-microscope hover:text-emerald-800 cursor-pointer text-base sm:text-lg"></i>
            <i className="fa-solid fa-notes-medical hover:text-emerald-800 cursor-pointer text-base sm:text-lg"></i>
          </div>

          <div className="text-[9px] sm:text-[10px] font-bold text-emerald-700/80 uppercase tracking-[0.2em] px-3">
             Affiliated to Krishna University • NAAC 'A' Grade • ISO 9001:2015
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-900 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
