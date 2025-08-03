from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os
import random # For simulating predictions

app = Flask(__name__)
CORS(app)

# Path to your downloaded Kaggle dataset CSV file
DATASET_FILE = 'Pintrest_Fashion data.csv' # Make sure this file is in the same directory as app.py

def load_and_process_data():
    """
    Loads the Pinterest fashion data from the Kaggle dataset,
    performs basic processing to derive "trends", and simulates predictions.

    In a real ML scenario, this function would:
    1. Load the dataset.
    2. Clean and preprocess the data.
    3. Train a machine learning model (e.g., for time-series forecasting,
       or classification/regression based on features).
    4. Use the trained model to generate actual trend predictions.
    5. Format the predictions into the structure expected by the frontend.
    """
    print(f"Attempting to load and process data from {DATASET_FILE}...")
    trends_data = []

    if not os.path.exists(DATASET_FILE):
        print(f"Error: Dataset file '{DATASET_FILE}' not found.")
        print("Please download 'fashion_data.csv' from https://www.kaggle.com/datasets/swatisubramanyam/pinterest-fashion-data")
        print("and place it in the same directory as app.py.")
        # Fallback to mock data if the file is not found
        return [
            {
                "id": 1, "trendName": "Fallback: Oversized Blazers", "category": "Outerwear",
                "currentPopularity": 85, "predictedPopularityChange": "+10",
                "keywords": ["blazer", "oversized", "formal", "casual", "chic"],
                "imageUrl": "https://placehold.co/300x200/F0F0F0/333333?text=Fallback+Data",
                "description": "Using fallback data. Please ensure Kaggle dataset is downloaded."
            },
            {
                "id": 2, "trendName": "Fallback: Cargo Pants", "category": "Bottoms",
                "currentPopularity": 78, "predictedPopularityChange": "+15",
                "keywords": ["cargo", "pants", "utility", "streetwear", "comfort"],
                "imageUrl": "https://placehold.co/300x200/F0F0F0/333333?text=Fallback+Data",
                "description": "Using fallback data. Please ensure Kaggle dataset is downloaded."
            }
        ]

    try:
        # Load the dataset
        df = pd.read_csv(DATASET_FILE)
        print(f"Dataset '{DATASET_FILE}' loaded successfully. Shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")

        # --- Basic Trend Extraction Simulation ---
        # Updated: Prioritize 'Type ' then 'Subtype' for category column
        category_col = None
        for col in ['Type ', 'Subtype', 'Category', 'category', 'ProductCategory', 'product_category']:
            if col in df.columns:
                category_col = col
                break

        if category_col and not df[category_col].empty: # Ensure the column exists and is not entirely empty
            # Group by category and get some aggregated info
            category_counts = df[category_col].value_counts()
            unique_categories = category_counts.index.tolist()

            for i, category in enumerate(unique_categories):
                # Filter items for the current category
                category_df = df[df[category_col] == category]

                # Simulate current popularity based on count (scaled)
                # Max count will be 100% popularity, others relative
                max_count = category_counts.max()
                current_popularity = int((category_counts[category] / max_count) * 100)
                current_popularity = min(max(current_popularity, 30), 95) # Keep within a reasonable range

                # Simulate predicted popularity change
                # Positive change for higher counts, negative for lower, or random
                predicted_change = random.randint(-10, 25) # Simulate a range of changes
                predicted_change_str = f"+{predicted_change}" if predicted_change >= 0 else str(predicted_change)

                # Extract keywords/description (simplified)
                keywords = []
                # Try to get keywords from 'description' or 'title'
                if 'description' in category_df.columns and not category_df['description'].isnull().all():
                    sample_desc = category_df['description'].dropna().iloc[0]
                    keywords = list(set([word.lower() for word in sample_desc.split() if len(word) > 3]))[:5]
                elif 'title' in category_df.columns and not category_df['title'].isnull().all():
                    sample_title = category_df['title'].dropna().iloc[0]
                    keywords = list(set([word.lower() for word in sample_title.split() if len(word) > 3]))[:5]
                else:
                    keywords = [category.lower().replace(' ', '-')] # Fallback to category name as keyword

                # Get a sample description
                description = f"Trends in the '{category}' category, derived from Kaggle data."
                if 'description' in category_df.columns and not category_df['description'].isnull().all():
                    description = category_df['description'].dropna().iloc[0][:150] + "..." # Take first 150 chars
                elif 'title' in category_df.columns and not category_df['title'].isnull().all():
                    description = category_df['title'].dropna().iloc[0][:150] + "..."

                # Use a sample image URL if available, otherwise a placeholder
                image_url = f"https://placehold.co/300x200/F0F0F0/333333?text={category.replace(' ', '+')}"
                if 'image_url' in category_df.columns and not category_df['image_url'].isnull().all():
                    # Take the first non-null image URL for the category
                    first_image_url = category_df['image_url'].dropna().iloc[0]
                    # Basic validation to ensure it looks like a URL
                    if first_image_url.startswith('http'):
                        image_url = first_image_url


                trends_data.append({
                    "id": i + 1,
                    "trendName": category,
                    "category": category,
                    "currentPopularity": current_popularity,
                    "predictedPopularityChange": predicted_change_str,
                    "keywords": keywords,
                    "imageUrl": image_url,
                    "description": description
                })
        else:
            print("Warning: No suitable category column found or column is empty. Cannot derive trends by category.")
            print("Using mock data as a fallback.")
            # Fallback to mock data if no category column is found or it's empty
            return [
                {
                    "id": 1, "trendName": "Fallback: Data Issue", "category": "Unknown",
                    "currentPopularity": 50, "predictedPopularityChange": "+0",
                    "keywords": ["data", "error", "check-console"],
                    "imageUrl": "https://placehold.co/300x200/CCCCCC/666666?text=Data+Error",
                    "description": "Could not process Kaggle data. Check backend console for column issues."
                }
            ]

    except Exception as e:
        print(f"Error loading or processing data: {e}")
        print("Falling back to mock data.")
        # Fallback to mock data on any processing error
        return [
            {
                "id": 1, "trendName": "Fallback: Processing Error", "category": "Error",
                "currentPopularity": 50, "predictedPopularityChange": "+0",
                "keywords": ["error", "processing", "check-console"],
                "imageUrl": "https://placehold.co/300x200/CCCCCC/666666?text=Processing+Error",
                "description": "An error occurred during data processing. See backend console."
            }
        ]

    return trends_data if trends_data else [] # Return empty list if no trends were generated

# Load data when the app starts
processed_fashion_data = load_and_process_data()

@app.route('/api/trends', methods=['GET'])
def get_trends():
    """
    API endpoint to return fashion trend data.
    """
    return jsonify(processed_fashion_data)

@app.route('/api/predict', methods=['POST'])
def predict_trend():
    """
    Placeholder for a prediction endpoint.
    In a real application, you might receive user input (e.g., an image, keywords)
    and use your ML model to predict a trend.
    """
    # For demonstration, we'll just return a static message.
    # In a real scenario, you'd parse request.json and use it for prediction.
    return jsonify({"message": "Prediction endpoint hit. Implement your ML prediction logic here!"})

if __name__ == '__main__':
    # You can change the port if needed, e.g., port=5001
    app.run(debug=True, port=5000)
