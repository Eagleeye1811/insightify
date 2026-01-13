import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

load_dotenv()

# Path to your Firebase service account JSON file
# User should export this env var or place the file in a known location
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "service_account.json")

class ReviewTool:
    def __init__(self):
        self.db = None
        try:
            # Check if app is already initialized to avoid errors on reload
            if not firebase_admin._apps:
                if os.path.exists(FIREBASE_CREDENTIALS_PATH):
                    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
                    firebase_admin.initialize_app(cred)
                    print(f"Firebase initialized with credentials from {FIREBASE_CREDENTIALS_PATH}")
                else:
                    print(f"Warning: Firebase credentials not found at {FIREBASE_CREDENTIALS_PATH}")
                    # fallback to default (e.g. if running in GCP environment)
                    # firebase_admin.initialize_app() 
            
            self.db = firestore.client()
            
        except Exception as e:
            print(f"Warning: Failed to initialize Firebase Firestore: {e}")
            self.db = None

    def query_reviews(self, query: str) -> List[Dict[str, Any]]:
        """
        Queries the Firestore database for reviews. 
        Note: Firestore has limited full-text search capabilities natively.
        This implementation retrieves recent reviews. 
        For full-text search, consider integrating Algolia or Typesense.
        """
        if not self.db:
            return [{"error": "Firestore client not initialized. Check credentials."}]

        print(f"Querying Firestore reviews (simulated search) for: {query}")
        
        try:
            # Simple retrieval of latest 5 reviews
            # Assuming a collection named 'reviews' exists
            reviews_ref = self.db.collection("reviews")
            
            # Since native full-text search isn't available, we just get recent ones
            # In a real app, you'd filter by category or use an external search index.
            docs = reviews_ref.limit(5).stream()
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                # Basic filtering in python if needed, or just return them
                results.append(data)
            
            if not results:
                return [{"message": "No reviews found in Firestore 'reviews' collection."}]
            
            return results

        except Exception as e:
            print(f"Error querying Firestore: {e}")
            return [{"error": str(e)}]

review_tool = ReviewTool()

def query_reviews(query: str):
    """
    Search for app reviews related to a specific topic or issue.
    Args:
        query: The search query.
    Returns:
        A list of relevant reviews.
    """
    return review_tool.query_reviews(query)
