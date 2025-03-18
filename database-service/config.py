import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'photo_op')

# AWS S3 configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

def get_database() -> Database:
    """Get MongoDB database instance."""
    client = MongoClient(MONGODB_URI)
    return client[DATABASE_NAME]

# Initialize database collections
db = get_database()
event_configs = db.event_configs
user_leads = db.user_leads 