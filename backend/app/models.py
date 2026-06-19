from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Literal
from datetime import datetime
from bson import ObjectId

# ------------------- User Models -------------------

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[str] = Field(alias="_id", default=None)
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class UserInDB(User):
    hashed_password: str

# ------------------- Token Models -------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ------------------- Login Response Model -------------------

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# ------------------- Post Models -------------------

class PostBase(BaseModel):
    title: str
    content: str

class PostReaction(BaseModel):
    user_id: str
    reaction_type: Literal["like", "dislike"]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Post(PostBase):
    id: Optional[str] = Field(alias="_id", default=None)
    author: str
    likes: List[str] = []  # List of user IDs who liked
    dislikes: List[str] = []  # List of user IDs who disliked
    reaction_count: Dict[str, int] = Field(
        default_factory=lambda: {"likes": 0, "dislikes": 0}
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

# ------------------- Comment Models -------------------

class CommentBase(BaseModel):
    content: str

class Comment(CommentBase):
    id: Optional[str] = Field(alias="_id", default=None)
    post_id: str
    author: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }
