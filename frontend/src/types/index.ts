export interface User {
  id: string
  email: string
  phone: string | null
  name: string | null
  avatar: string | null
  birthday: string | null
  gender: string | null
  show_stats: boolean
  role: string
  created_at: string
}

export interface UserStats {
  comments_count: number
  reactions_given: number
  reactions_received: number
  news_read: number
  bookmarks_count: number
}

export interface UserComment {
  id: string
  content: string
  created_at: string
  likes_count: number
  news_id: string
  news_title: string | null
}

export interface RecentRead {
  id: string
  title: string
  main_image: string | null
  published_at: string | null
  viewed_at: string
}

export interface PublicProfile {
  id: string
  name: string | null
  avatar: string | null
  created_at: string
  comments_count: number
  show_stats: boolean
  stats: {
    comments_count: number
    reactions_given: number
    reactions_received: number
    news_read: number
  } | null
  comments: UserComment[]
}

export interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'youtube'
  content: string
  position: number
}

export interface CategoryBrief {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface NewsItem {
  id: string
  title: string
  preview_text: string
  main_image: string | null
  views_count: number
  comments_count: number
  is_published: boolean
  published_at: string | null
  created_at: string
  author: User
  categories: CategoryBrief[]
}

export interface NewsDetail extends NewsItem {
  content: string
  blocks: ContentBlock[]
}

export interface NewsPaginated {
  items: NewsItem[]
  total: number
  page: number
  per_page: number
}

export interface Comment {
  id: string
  content: string
  likes_count: number
  created_at: string
  user: User
  is_liked_by_me: boolean
}

export interface Bookmark {
  id: string
  news: NewsItem
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
