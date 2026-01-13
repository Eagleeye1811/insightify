const gplay = require('google-play-scraper');

async function test() {
    console.log("Testing google-play-scraper directly...");
    console.log("gplay export keys:", Object.keys(gplay));
    console.log("gplay type:", typeof gplay);
    if (gplay.default) {
        console.log("gplay.default keys:", Object.keys(gplay.default));
    }

    try {
        // Try various ways
        let searchFn = gplay.search;
        if (!searchFn && gplay.default) searchFn = gplay.default.search;

        if (searchFn) {
            const results = await searchFn({ term: "Whatsapp", num: 1 });
            console.log("Search result:", results);
        } else {
            console.error("Could not find search function");
        }
    } catch (e) {
        console.error("Search failed:", e);
    }
}

test();
