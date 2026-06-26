
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TimetableBoard from './components/TimetableBoard';
import LoginForm from './components/Admin/LoginForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import { getSession, setSession, getState, saveState } from './services/dataStore';
import { fetchFromCloud, syncToCloud } from './services/googleSheetsService';
import { fetchStateFromFirestore, saveStateToFirestore, testFirestoreConnection } from './services/firebaseService';


const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState(getState());
  const [isInitialSync, setIsInitialSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Synchronizing Core Database...');
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'unreachable' | 'disabled'>('disabled');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Monitor installation signals for Android / Chrome mobile
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent browser automated installation banner
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Initial Data Pull or Push to Cloud
  useEffect(() => {
    const initApp = async () => {
      const session = getSession();
      if (session) {
        setIsLoggedIn(true);
      }

      const currentState = getState();
      if (currentState.settings.cloudDbEnabled) {
        try {
          await testFirestoreConnection();
          let cloudData = null;

          // 1. Try primary Google Sheets integration
          if (currentState.settings.googleSheetWebAppUrl) {
            try {
              setSyncStatus('Fetching from Primary Cloud (Google Sheets)...');
              cloudData = await fetchFromCloud(currentState.settings.googleSheetWebAppUrl);
            } catch (sheetErr) {
              console.warn("Primary Google Sheet Web App fetch exception. Operating on safety Firestore...", sheetErr);
            }
          }

          // 2. Cascade fallback to Safety Google Firestore Database
          if (!cloudData) {
            setSyncStatus('Fetching from Safety Firestore Database...');
            cloudData = await fetchStateFromFirestore();
          }

          if (cloudData) {
            // Cloud or Safety DB has data, use it
            saveState(cloudData);
            setAppState(cloudData);
            setCloudStatus('connected');
          } else {
            // Handshake first time setups
            setSyncStatus('Initializing Safety Databases...');
            if (currentState.settings.googleSheetWebAppUrl) {
              await syncToCloud(currentState.settings.googleSheetWebAppUrl, currentState);
            }
            await saveStateToFirestore(currentState);
            setCloudStatus('connected');
          }
        } catch (err) {
          console.warn("Initial cloud sync and safety fallback failed, using local storage", err);
          setCloudStatus('unreachable');
        }
      } else {
        setCloudStatus(currentState.settings.cloudDbEnabled ? 'unreachable' : 'disabled');
      }
      setIsInitialSync(false);
    };

    initApp();
  }, []);

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setSession(null);
    setIsLoggedIn(false);
    setIsAdminMode(false);
  };

  if (isInitialSync) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-400 rounded-full animate-spin mb-8"></div>
        <div className="text-center">
          <h2 className="text-xl font-black uppercase tracking-[0.3em] mb-2 text-emerald-100">KVSR SCOPS</h2>
          <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest animate-pulse max-w-xs mx-auto">
            {syncStatus}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout isAdminMode={isAdminMode} onAdminToggle={toggleAdminMode} isLoggedIn={isLoggedIn} onLogout={handleLogout}>
      {isAdminMode ? (
        isLoggedIn ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <LoginForm onLogin={handleLoginSuccess} />
        )
      ) : (
        <>
          {cloudStatus === 'unreachable' && (
            <div className="max-w-7xl mx-auto px-4 pt-8">
              <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-950 shadow-sm animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <i className="fa-solid fa-cloud-slash text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-800">Cloud Unreachable (Local Fallback Active)</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-relaxed">
                      Sync connection failed. The application is operating on high-speed offline storage mode. Your layout and timetable records are secure.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    setSyncStatus('Re-connecting to Cloud safety network...');
                    setIsInitialSync(true);
                    const currentState = getState();
                    try {
                      await testFirestoreConnection();
                      let cloudData = null;
                      if (currentState.settings.googleSheetWebAppUrl) {
                        try {
                          cloudData = await fetchFromCloud(currentState.settings.googleSheetWebAppUrl);
                        } catch (sheetErr) {
                          console.warn("Retry Google Sheet fetch exception, checking Firestore:", sheetErr);
                        }
                      }
                      if (!cloudData) {
                        cloudData = await fetchStateFromFirestore();
                      }
                      if (cloudData) {
                        saveState(cloudData);
                        setAppState(cloudData);
                      }
                      setCloudStatus('connected');
                    } catch (err) {
                      setCloudStatus('unreachable');
                    }
                    setIsInitialSync(false);
                  }}
                  className="px-6 py-3 bg-white hover:bg-slate-50 border border-amber-200 text-amber-800 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 shadow-sm active:scale-95"
                >
                  Retry Connect
                </button>
              </div>
            </div>
          )}

          {/* Hero / Banner */}
          <section className="pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[3rem] p-8 md:p-14 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
                
                <div className="absolute top-0 right-0 w-full md:w-[60%] h-full opacity-40 md:opacity-60 overflow-hidden">
                  <div className="w-full h-full relative">
                    <iframe 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[100%] min-h-[100%] w-auto h-auto object-cover pointer-events-none scale-150"
                      src="https://www.youtube.com/embed/yFmMVeATMaQ?autoplay=1&mute=1&controls=0&loop=1&playlist=yFmMVeATMaQ&modestbranding=1&rel=0" 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    ></iframe>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-2xl text-left animate-in fade-in slide-in-from-left-8 duration-700">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase mb-8 backdrop-blur-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Digital Academic Hub
                  </div>
                  <h1 className="text-4xl md:text-8xl font-black mb-6 leading-[1.1] tracking-tight text-white">
                    Digital Pharmacy <br/>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-teal-100">
                      Academic Gateway
                    </span>
                  </h1>
                  <p className="text-emerald-100/80 text-sm md:text-lg mb-10 font-medium leading-relaxed max-w-lg">
                    KVSR Siddhartha institutional portal. Automated timetable management and seamless faculty coordination for B.Pharm, Pharm.D, and M.Pharm.
                  </p>
                  
                  <div className="flex flex-wrap gap-5">
                    <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black shadow-xl shadow-emerald-900/20 transition-all hover:-translate-y-1 active:scale-95 text-[10px] uppercase tracking-widest">
                      Live Schedule
                    </button>
                    <button 
                      onClick={toggleAdminMode}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black border border-white/20 backdrop-blur-md transition-all text-[10px] uppercase tracking-widest"
                    >
                      Admin Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Android App & Group Distribution Hub */}
          <section className="max-w-7xl mx-auto px-4 mt-4 mb-8 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-[#0c4a6e] to-[#0369a1] rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-sky-400/20 flex items-center justify-center text-sky-200 border border-sky-400/30 text-3xl shrink-0 shadow-lg">
                  <i className="fa-brands fa-android"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase text-white">KVSR SCOPS Android App Assistant</h3>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-sky-200 mt-1">Install on Android or instant-share with your faculty cohort</p>
                  <p className="text-xs text-sky-100/90 mt-2 max-w-2xl font-medium leading-relaxed">
                    Access real-time schedules, academic registries, and automated substitutions with mobile-first speed. In <span className="font-bold text-sky-200">Google Chrome on Android</span>, tap the install button below to save it as a native standalone app on your phone with zero delay!
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 flex flex-wrap gap-3.5 shrink-0 w-full lg:w-auto justify-start lg:justify-end">
                {showInstallPrompt && (
                  <button 
                    onClick={async () => {
                      if (deferredPrompt) {
                        try {
                          deferredPrompt.prompt();
                          const { outcome } = await deferredPrompt.userChoice;
                          console.log(`PWA install prompt result: ${outcome}`);
                        } catch (e) {
                          console.warn("Prompt trigger error:", e);
                        }
                        setDeferredPrompt(null);
                        setShowInstallPrompt(false);
                      }
                    }}
                    className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2.5 shadow-lg shadow-sky-900/30 shrink-0 cursor-pointer"
                  >
                    <i className="fa-solid fa-download"></i>
                    Install App on Phone
                  </button>
                )}
                <button 
                  onClick={() => {
                    const shareText = `Hey team! 🏫 Here is the live, installable Android-ready portal for KVSR SCOPS Academic Portal (Timetables, substitutes tracker, and logs synced with Google Sheets/Firestore). Open it in Google Chrome on your phone, and tap install to use it like a native app!\n\n🌐 Open and Install: ${window.location.href}`;
                    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2.5 shadow-lg shadow-emerald-950/30 shrink-0 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  Share to WhatsApp Group
                </button>
                <button 
                  onClick={() => {
                    const shareText = `Hey team! 🏫 Here is our live, installable Android portal for KVSR SCOPS:\n\n${window.location.href}`;
                    navigator.clipboard.writeText(shareText);
                    alert("📋 Standard invite has been copied to your clipboard! Paste it into your faculty or peer group chat.");
                  }}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2.5 border border-slate-700 shadow-md shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-copy"></i>
                  Copy Invite Link
                </button>
              </div>
            </div>
          </section>

          <section className="animate-in fade-in duration-1000 delay-300">
            <TimetableBoard />
          </section>

          <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {[
              { icon: 'fa-vial-circle-check', label: 'B.Pharm Intake', value: '100+', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: 'fa-user-doctor', label: 'Pharm.D Scholars', value: '30+', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: 'fa-award', label: 'NAAC Rating', value: 'A Grade', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: 'fa-hand-holding-medical', label: 'Hospital Ties', value: '5+', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className={`glass p-8 rounded-[2rem] text-center border-white shadow-xl shadow-emerald-900/5 transition-all hover:scale-105`}>
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl shadow-inner`}>
                   <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-emerald-900">{stat.value}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </Layout>
  );
};

export default App;
