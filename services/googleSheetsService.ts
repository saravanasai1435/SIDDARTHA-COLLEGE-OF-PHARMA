
import { AppState } from "../types";

/**
 * Optimized REST logic for optional Google Sheets integration.
 * Uses 'text/plain' to avoid CORS preflight (OPTIONS) which Google Apps Script doesn't support.
 */
export const syncToCloud = async (url: string, state: AppState): Promise<boolean> => {
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) return false;
  // Ignore placeholder or known inactive demo script URL
  if (url.includes('AKfycbx8_TxBONe9Lu_L9TLtz7-ouYFceGA8hfrcAKf1OBZtTDstftr3p_5ll1E3gQF2QjzR')) {
    return false;
  }

  try {
    await fetch(url.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 
        'Content-Type': 'text/plain;charset=utf-8' 
      },
      body: JSON.stringify(state),
    });
    return true; 
  } catch (error) {
    console.warn("Optional Google Sheets sync skipped:", error);
    return false;
  }
};

/**
 * Fetches the application state from the optional Google Sheet Web App.
 * Handles redirects and basic validation, returning null gracefully if unreachable.
 */
export const fetchFromCloud = async (url: string): Promise<AppState | null> => {
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) return null;
  // Ignore placeholder or known inactive demo script URL
  if (url.includes('AKfycbx8_TxBONe9Lu_L9TLtz7-ouYFceGA8hfrcAKf1OBZtTDstftr3p_5ll1E3gQF2QjzR')) {
    return null;
  }

  try {
    const response = await fetch(url.trim(), { 
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow'
    });

    if (!response.ok) {
      console.warn(`Optional Google Sheets endpoint status: ${response.status} ${response.statusText}`);
      return null;
    }

    const rawData = await response.json();
    
    // Support both direct objects and stringified objects wrapped in a response
    let data = rawData;
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.warn("Google Sheet response was not valid JSON format");
        return null;
      }
    }

    // Validation: If it has 'config' and 'settings' or 'timetable', it's valid
    if (data && typeof data === 'object' && (data.config || data.settings || data.timetable)) {
      console.log("Google Sheets state validated successfully.");
      return data as AppState;
    }
    
    console.warn("Google Sheet data missing required state properties");
    return null;
  } catch (error) {
    console.warn("Optional Google Sheets fetch not available; operating on Firestore:", error);
    return null;
  }
};

