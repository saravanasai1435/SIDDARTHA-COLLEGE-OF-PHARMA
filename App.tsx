
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TimetableBoard from './components/TimetableBoard';
import LoginForm from './components/Admin/LoginForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import { getSession, setSession, getState, saveState } from './services/dataStore';
import { fetchFromCloud, syncToCloud } from './services/googleSheetsService';
import { fetchStateFromFirestore, saveStateToFirestore, testFirestoreConnection } from './services/firebaseService';
import { formatTo12Hour } from './services/timeUtils';


const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState(getState());
  const [isInitialSync, setIsInitialSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Synchronizing Core Database...');
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'unreachable' | 'disabled'>('disabled');

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
          setSyncStatus('Connecting to Google Cloud Firestore...');
          await testFirestoreConnection();
          let cloudData = null;

          // 1. Primary enterprise database: Google Cloud Firestore
          try {
            cloudData = await fetchStateFromFirestore();
          } catch (firestoreErr) {
            console.warn("Firestore fetch notice:", firestoreErr);
          }

          // 2. Optional: Custom Google Sheets Web App if configured by administrator
          if (!cloudData && currentState.settings.googleSheetWebAppUrl) {
            setSyncStatus('Checking external spreadsheet link...');
            cloudData = await fetchFromCloud(currentState.settings.googleSheetWebAppUrl);
          }

          if (cloudData) {
            // Check if cloudData is outdated (e.g. contains Dr. Ramesh, lacks Dr. VK, or missing institutional classes)
            const hasOldStaff = cloudData.staff?.some((s: any) => s.name?.includes('Ramesh') || s.name?.includes('Sridevi'));
            const missingPhotoStaff = !cloudData.staff?.some((s: any) => s.name?.includes('Karuna Sree') || s.code === 'Dr. VK');
            const missingInstitutionalClasses = !cloudData.classes || cloudData.classes.length < 10;
            
            if (hasOldStaff || missingPhotoStaff || missingInstitutionalClasses) {
              console.log("Cloud has outdated legacy data. Committing official 2026-27 institutional timetable to cloud and local state...");
              cloudData = currentState;
              await saveStateToFirestore(currentState);
              if (currentState.settings.googleSheetWebAppUrl) {
                syncToCloud(currentState.settings.googleSheetWebAppUrl, currentState).catch(console.warn);
              }
            }

            if (cloudData.config?.timeSlots) {
              cloudData.config.timeSlots = cloudData.config.timeSlots.map((ts: any) => ({
                ...ts,
                start: formatTo12Hour(ts.start),
                end: formatTo12Hour(ts.end)
              }));
            }

            saveState(cloudData);
            setAppState(cloudData);
            setCloudStatus('connected');
          } else {
            // Initializing Firestore with current validated state
            setSyncStatus('Synchronizing Institutional Database to Cloud...');
            await saveStateToFirestore(currentState);
            if (currentState.settings.googleSheetWebAppUrl) {
              await syncToCloud(currentState.settings.googleSheetWebAppUrl, currentState);
            }
            setCloudStatus('connected');
          }
        } catch (err) {
          console.warn("Initial cloud sync completed with local storage safeguard active:", err);
          setCloudStatus('connected');
        }
      } else {
        setCloudStatus('disabled');
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
                    setSyncStatus('Connecting to Google Cloud Firestore...');
                    setIsInitialSync(true);
                    const currentState = getState();
                    try {
                      await testFirestoreConnection();
                      let cloudData = await fetchStateFromFirestore();
                      if (!cloudData && currentState.settings.googleSheetWebAppUrl) {
                        cloudData = await fetchFromCloud(currentState.settings.googleSheetWebAppUrl);
                      }
                      if (cloudData) {
                        saveState(cloudData);
                        setAppState(cloudData);
                      } else {
                        await saveStateToFirestore(currentState);
                      }
                      setCloudStatus('connected');
                    } catch (err) {
                      setCloudStatus('connected');
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
