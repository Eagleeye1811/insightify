import { auth } from '../lib/firebase';

/**
 * Get Firebase ID token for authenticated user
 * @returns {Promise<string>} Firebase ID token
 */
export async function getAuthToken() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return await user.getIdToken();
}

/**
 * Make authenticated API request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(url, options = {}) {
    const token = await getAuthToken();

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
}
