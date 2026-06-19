from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv
import logging
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Atlas Configuration
MONGO_URI = getenv("MONGO_URI")
DATABASE_NAME = getenv("DATABASE_NAME", "Blog")

if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set")

try:
    # Initialize MongoDB client with proper settings for Atlas
    client = AsyncIOMotorClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
        maxPoolSize=50,
        retryWrites=True
    )
    
    # Get database instance
    database = client[DATABASE_NAME]
    
    # Collections
    users_collection = database.users
    posts_collection = database.posts
    comments_collection = database.comments

    # Test connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB Atlas!")

except Exception as e:
    logger.error(f"Failed to connect to MongoDB Atlas: {str(e)}")
    raise Exception(f"Database connection failed: {str(e)}")

async def init_db():
    """Initialize database indexes"""
    try:
        # Create indexes
        await users_collection.create_index("username", unique=True)
        await users_collection.create_index("email", unique=True)
        await posts_collection.create_index("author")
        await comments_collection.create_index("post_id")
        logger.info("Database indexes created successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database initialization failed: {str(e)}"
        ) 