from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import List, Dict, Literal, Optional
from bson import ObjectId
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from .models import (
    UserCreate, User, Token, Post, PostBase,
    Comment, CommentBase, UserBase, LoginResponse,
    PostReaction
)
from .auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token,
    get_current_active_user, get_password_hash,
    authenticate_user, LoginForm
)
from .database import (
    users_collection, posts_collection,
    comments_collection, init_db,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Blog API",
    description="""
    A Blog API with Bearer token authentication.
    
    ## Public Routes
    - GET /posts (List all posts)
    - GET /posts/{post_id}/comments (List comments for a post)
    
    ## Protected Routes (Require Authentication)
    All other routes require authentication using Bearer token:
    1. Register a new user (`/auth/register`)
    2. Login to get a token (`/auth/login`)
    3. Click the 'Authorize' button above and enter your token
    """
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Auth Routes
@app.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    logger.info(f"Attempting to register user: {user_data.email}")
    
    try:
        # Check for existing email
        if await users_collection.find_one({"email": user_data.email}):
            logger.warning(f"Email already registered: {user_data.email}")
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Check for existing username
        if await users_collection.find_one({"username": user_data.username}):
            logger.warning(f"Username already taken: {user_data.username}")
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
        
        # Prepare user data
        user_dict = user_data.dict()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        user_dict["is_admin"] = False
        user_dict["created_at"] = datetime.utcnow()
        
        logger.info(f"Inserting new user: {user_data.username}")
        result = await users_collection.insert_one(user_dict)
        logger.info(f"User inserted with ID: {result.inserted_id}")
        
        # Verify the user was actually inserted
        created_user = await users_collection.find_one({"_id": result.inserted_id})
        if not created_user:
            logger.error("User not found after insertion!")
            raise HTTPException(
                status_code=500,
                detail="Failed to create user"
            )
        
        created_user["_id"] = str(created_user["_id"])
        logger.info(f"Successfully registered user: {user_data.username}")
        return User(**created_user)
        
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/auth/login", response_model=LoginResponse)
async def login(form_data: LoginForm):
    logger.info(f"Login attempt for email: {form_data.email}")
    try:
        user = await authenticate_user(form_data.email, form_data.password)
        if not user:
            logger.warning(f"Failed login attempt for email: {form_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Convert user to dict and remove hashed_password
        user_dict = user.dict()
        if "hashed_password" in user_dict:
            del user_dict["hashed_password"]
        
        logger.info(f"Successful login for user: {user.username}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": User(**user_dict)
        }
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )

# Public Routes
@app.get("/posts", response_model=List[Post])
async def list_posts():
    """List all posts - Public route"""
    try:
        logger.info("Fetching all posts")
        posts = await posts_collection.find().to_list(1000)
        logger.info(f"Found {len(posts)} posts")
        for post in posts:
            post["_id"] = str(post["_id"])
        return posts
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch posts"
        )

@app.get("/posts/{post_id}/comments", response_model=List[Comment])
async def list_comments(post_id: str):
    """List comments for a post - Public route"""
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    comments = await comments_collection.find({"post_id": post_id}).to_list(1000)
    for comment in comments:
        comment["_id"] = str(comment["_id"])
    return comments

# Protected Routes
@app.post("/posts", response_model=Post)
async def create_post(
    post: PostBase,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new post - Protected route"""
    post_dict = post.dict()
    post_dict["author"] = current_user.username
    post_dict["likes"] = []
    
    result = await posts_collection.insert_one(post_dict)
    post_dict["_id"] = str(result.inserted_id)
    return Post(**post_dict)

@app.get("/posts/{post_id}", response_model=Post)
async def get_post(
    post_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a single post - Protected route"""
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post["_id"] = str(post["_id"])
    return post

@app.put("/posts/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    post_update: PostBase,
    current_user: User = Depends(get_current_active_user)
):
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["author"] != current_user.username and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    update_data = post_update.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await posts_collection.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    updated_post = await posts_collection.find_one({"_id": object_id})
    updated_post["_id"] = str(updated_post["_id"])
    return updated_post

@app.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_active_user)
):
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["author"] != current_user.username and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    await posts_collection.delete_one({"_id": object_id})
    await comments_collection.delete_many({"post_id": post_id})
    return {"message": "Post deleted"}

# Comment Routes
@app.post("/posts/{post_id}/comments", response_model=Comment)
async def create_comment(
    post_id: str,
    comment: CommentBase,
    current_user: User = Depends(get_current_active_user)
):
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not await posts_collection.find_one({"_id": object_id}):
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_dict = comment.dict()
    comment_dict["post_id"] = post_id
    comment_dict["author"] = current_user.username
    
    result = await comments_collection.insert_one(comment_dict)
    comment_dict["_id"] = str(result.inserted_id)
    return Comment(**comment_dict)

@app.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_active_user)
):
    try:
        object_id = ObjectId(comment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid comment ID")
    
    comment = await comments_collection.find_one({"_id": object_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment["author"] != current_user.username and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    await comments_collection.delete_one({"_id": object_id})
    return {"message": "Comment deleted"}

# Like/Dislike Routes
@app.post("/posts/{post_id}/react", response_model=Post)
async def react_to_post(
    post_id: str,
    reaction_type: Literal["like", "dislike"],
    current_user: User = Depends(get_current_active_user)
):
    """
    React to a post (like or dislike).
    If user has already reacted, it will toggle their reaction:
    - If same reaction type, it will remove the reaction
    - If different reaction type, it will switch to the new reaction
    """
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Initialize lists if they don't exist
    if "likes" not in post:
        post["likes"] = []
    if "dislikes" not in post:
        post["dislikes"] = []
    
    user_id = str(current_user.id)
    update_data = {}
    
    # Handle reaction logic
    if reaction_type == "like":
        if user_id in post["likes"]:
            # Remove like if already liked
            update_data = {
                "$pull": {"likes": user_id},
                "$inc": {"reaction_count.likes": -1}
            }
        else:
            # Add like and remove dislike if exists
            update_data = {
                "$addToSet": {"likes": user_id},
                "$pull": {"dislikes": user_id},
                "$inc": {
                    "reaction_count.likes": 1,
                    "reaction_count.dislikes": -1 if user_id in post["dislikes"] else 0
                }
            }
    else:  # dislike
        if user_id in post["dislikes"]:
            # Remove dislike if already disliked
            update_data = {
                "$pull": {"dislikes": user_id},
                "$inc": {"reaction_count.dislikes": -1}
            }
        else:
            # Add dislike and remove like if exists
            update_data = {
                "$addToSet": {"dislikes": user_id},
                "$pull": {"likes": user_id},
                "$inc": {
                    "reaction_count.dislikes": 1,
                    "reaction_count.likes": -1 if user_id in post["likes"] else 0
                }
            }
    
    # Update the post
    await posts_collection.update_one(
        {"_id": object_id},
        update_data
    )
    
    # Get updated post
    updated_post = await posts_collection.find_one({"_id": object_id})
    updated_post["_id"] = str(updated_post["_id"])
    
    # Initialize reaction count if it doesn't exist
    if "reaction_count" not in updated_post:
        updated_post["reaction_count"] = {
            "likes": len(updated_post.get("likes", [])),
            "dislikes": len(updated_post.get("dislikes", []))
        }
    
    return Post(**updated_post)

@app.get("/posts/{post_id}/reactions", response_model=Dict[str, Dict[str, int]])
async def get_post_reactions(post_id: str):
    """
    Get the reaction counts for a post.
    Returns both like and dislike counts.
    """
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    reaction_count = post.get("reaction_count", {
        "likes": len(post.get("likes", [])),
        "dislikes": len(post.get("dislikes", []))
    })
    
    return {"reactions": reaction_count}

@app.get("/posts/{post_id}/user-reaction", response_model=Dict[str, Optional[str]])
async def get_user_reaction(
    post_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's reaction to a post.
    Returns the type of reaction (like/dislike) or null if no reaction.
    """
    try:
        object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_id = str(current_user.id)
    reaction_type = None
    
    if user_id in post.get("likes", []):
        reaction_type = "like"
    elif user_id in post.get("dislikes", []):
        reaction_type = "dislike"
    
    return {"reaction": reaction_type}

# User Routes
@app.get("/users/{username}", response_model=User)
async def get_user_profile(
    username: str,
    current_user: User = Depends(get_current_active_user)
):
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

@app.put("/users/{username}", response_model=User)
async def update_user_profile(
    username: str,
    user_update: UserBase,
    current_user: User = Depends(get_current_active_user)
):
    if username != current_user.username and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to edit this profile")
    
    if username != user_update.username:
        if await users_collection.find_one({"username": user_update.username}):
            raise HTTPException(status_code=400, detail="Username already taken")
    
    if current_user.email != user_update.email:
        if await users_collection.find_one({"email": user_update.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
    
    update_data = user_update.dict()
    await users_collection.update_one(
        {"username": username},
        {"$set": update_data}
    )
    
    updated_user = await users_collection.find_one({"username": user_update.username})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@app.post("/users/{username}/change-password")
async def change_password(
    username: str,
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user)
):
    if username != current_user.username and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to change this password")
    
    user = await authenticate_user(username, old_password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    hashed_password = get_password_hash(new_password)
    await users_collection.update_one(
        {"username": username},
        {"$set": {"hashed_password": hashed_password}}
    )
    return {"message": "Password updated successfully"} 