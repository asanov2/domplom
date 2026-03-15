from app.models.user import User
from app.models.news import News
from app.models.news_content_block import NewsContentBlock
from app.models.category import Category
from app.models.news_category import news_category
from app.models.comment import Comment
from app.models.comment_like import CommentLike
from app.models.bookmark import Bookmark
from app.models.news_view import NewsView

__all__ = [
    "User",
    "News",
    "NewsContentBlock",
    "Category",
    "news_category",
    "Comment",
    "CommentLike",
    "Bookmark",
    "NewsView",
]
