import { ProgressState } from '../types';

// Configured Firebase Realtime Database URL
const FIREBASE_DB_URL = 'https://dental-topics-for-spoo-default-rtdb.asia-southeast1.firebasedatabase.app';

/**
 * Fetches the entire progress object from Firebase.
 */
export const fetchProgress = async (): Promise<ProgressState | null> => {
  if (FIREBASE_DB_URL.includes('YOUR_PROJECT_ID')) {
    console.warn('Firebase URL not configured. Please update services/firebase.ts');
    return null;
  }

  try {
    const response = await fetch(`${FIREBASE_DB_URL}/dental_progress.json`);
    if (!response.ok) {
      throw new Error(`Firebase error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch progress:', error);
    return null;
  }
};

/**
 * Updates a specific checkbox value in Firebase using PATCH for efficiency.
 * @param topicId The ID of the topic (e.g., "1", "2")
 * @param column The specific column key (e.g., "m10", "revise")
 * @param value The new boolean value
 */
export const saveTopicProgress = async (topicId: string, column: string, value: boolean) => {
  if (FIREBASE_DB_URL.includes('YOUR_PROJECT_ID')) return;

  try {
    // We construct the URL to point specifically to the field we want to update
    // Structure: /dental_progress/<topicId>.json
    // Method: PATCH (to update only the specific field provided in body)
    const url = `${FIREBASE_DB_URL}/dental_progress/${topicId}.json`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [column]: value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save progress: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error saving progress to Firebase:', error);
  }
};

/**
 * Saves UI state (filters, tab) to Firebase.
 * @param state The state object to save
 */
export const saveUIState = async (state: any) => {
  if (FIREBASE_DB_URL.includes('YOUR_PROJECT_ID')) return;
  try {
    const url = `${FIREBASE_DB_URL}/dental_settings.json`;
    await fetch(url, {
      method: 'PUT', // Overwrite old settings
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch (error) {
    console.error('Error saving settings to Firebase:', error);
  }
};

/**
 * Fetches UI state (filters, tab) from Firebase.
 */
export const fetchUIState = async (): Promise<any | null> => {
  if (FIREBASE_DB_URL.includes('YOUR_PROJECT_ID')) return null;
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/dental_settings.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching settings from Firebase:', error);
    return null;
  }
};