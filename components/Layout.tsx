
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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer group" onClick={() => !isAdminMode ? window.location.reload() : onAdminToggle?.()}>
            <div className="border-l-2 border-emerald-100 pl-5">
              <span className="text-xl font-black text-emerald-900 block leading-none tracking-tight">
                KVSR SCOPS
              </span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] whitespace-nowrap mt-1 block">
                Pharmacy Timetable
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12 text-xs font-bold uppercase tracking-widest">
            <button 
              onClick={() => isAdminMode && onAdminToggle && onAdminToggle()}
              className={`transition-colors relative pb-1 ${!isAdminMode ? 'text-emerald-600' : 'text-emerald-800/60 hover:text-emerald-600'}`}
            >
              Dashboard
              {!isAdminMode && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600"></div>}
            </button>
            <div className="flex items-center gap-4">
              <span className={`transition-colors ${isAdminMode ? 'text-emerald-600' : 'text-emerald-800/60'}`}>Admin Portal</span>
              <button 
                onClick={onAdminToggle}
                className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-50 hover:bg-emerald-200 transition-all shadow-sm"
              >
                <i className="fa-solid fa-user-shield text-xl"></i>
              </button>
            </div>
          </nav>

          <div className="md:hidden">
            <button 
              onClick={onAdminToggle}
              className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-50 shadow-sm"
            >
              <i className="fa-solid fa-user-shield"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="glass border-t border-emerald-100 py-12 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center mb-6">
             <img 
               src="https://kvsrsiddharthapharma.edu.in/images/logo_home.png" 
               alt="KVSR SCOPS Logo" 
               className="h-20 w-auto object-contain mb-8 opacity-80 hover:opacity-100 transition-opacity"
               referrerPolicy="no-referrer"
             />
             <div className="w-12 h-1 bg-emerald-600 rounded-full mb-4"></div>
             <p className="text-emerald-900 font-black text-lg uppercase tracking-tight">K.V.S.R. Siddhartha College of Pharmaceutical Sciences</p>
             <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Siddhartha Nagar, Vijayawada - 520010, A.P.</p>
          </div>
          
          <div className="flex justify-center gap-8 mb-8 text-emerald-400">
            <i className="fa-solid fa-flask hover:text-emerald-600 cursor-pointer"></i>
            <i className="fa-solid fa-microscope hover:text-emerald-600 cursor-pointer"></i>
            <i className="fa-solid fa-notes-medical hover:text-emerald-600 cursor-pointer"></i>
          </div>

          <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.3em]">
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
