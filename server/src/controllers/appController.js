const { db } = require('../config/firebase');

exports.listApps = async (req, res) => {
    try {
        const userId = req.user.uid;
        console.log(`[listApps] Requesting apps for User ID: ${userId}`);

        // precise-reference: /users/{userId}/apps
        const appsRef = db.collection('users').doc(userId).collection('apps');
        console.log(`[listApps] Path: ${appsRef.path}`);

        // listDocuments() is efficient for getting IDs even if docs are empty
        const appDocs = await appsRef.listDocuments();
        console.log(`[listApps] Found ${appDocs.length} app documents (refs)`);

        const apps = [];

        // Parallel fetch of metadata for all apps
        // Limit concurrency if needed, but for typical user (<20 apps) Promise.all is fine
        await Promise.all(appDocs.map(async (docRef) => {
            try {
                const metaRef = docRef.collection('data').doc('metadata');
                const metaSnap = await metaRef.get();

                if (metaSnap.exists) {
                    const data = metaSnap.data();
                    apps.push({
                        appId: docRef.id,
                        title: data.title || docRef.id,
                        icon: data.icon || "",
                        lastAnalyzed: data.updated || null,
                        score: data.score || 0
                    });
                } else {
                    console.log(`[listApps] Metadata missing for ${docRef.id}`);
                    // Include basic ID if metadata missing (e.g. failed scrape)
                    apps.push({
                        appId: docRef.id,
                        title: docRef.id,
                        status: "pending"
                    });
                }
            } catch (err) {
                console.warn(`Failed to fetch metadata for ${docRef.id}`, err);
            }
        }));

        console.log(`[listApps] returning ${apps.length} apps`);
        res.json(apps);

    } catch (error) {
        console.error('List apps error:', error);
        res.status(500).json({ error: error.message });
    }
};
