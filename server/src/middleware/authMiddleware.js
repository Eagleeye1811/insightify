const { admin } = require('../config/firebase');

/**
 * Authentication Middleware
 * Verifies Firebase ID token and attaches user info to request
 */
async function authenticateUser(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authentication token provided'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication token expired'
            });
        }

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authentication token'
        });
    }
}

module.exports = { authenticateUser };
