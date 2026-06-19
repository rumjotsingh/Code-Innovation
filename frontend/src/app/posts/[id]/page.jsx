"use client"
import { useEffect, useState, useContext } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AuthContext } from "../../../context/authcontext"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { MessageCircle, Edit, Trash2, User, Calendar, ThumbsUp, ThumbsDown, Send, Save, X } from "lucide-react"

export default function PostDetailPage() {
  const { token } = useContext(AuthContext)
  const params = useParams()
  const postId = params.id
  const [post, setPost] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Comments states
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentInput, setCommentInput] = useState("")
  const [commentAdding, setCommentAdding] = useState(false)
  // Comment editing/deletion
  const [commentEditId, setCommentEditId] = useState(null)
  const [commentEditContent, setCommentEditContent] = useState("")
  const [commentDeleteId, setCommentDeleteId] = useState(null)
  const [commentDeleteOpen, setCommentDeleteOpen] = useState(false)

  // Like/dislike state
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 })
  const [likeLoading, setLikeLoading] = useState(false)
  const [dislikeLoading, setDislikeLoading] = useState(false)

  const router = useRouter()

  // Current username from auth localStorage
  let currentUsername = ""
  if (typeof window !== "undefined") {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}")
    currentUsername = auth?.user?.username
  }

  // Fetch post
  useEffect(() => {
    fetch(`https://blog-l9cl.onrender.com/posts/${postId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPost(data)
        setForm({ title: data.title, content: data.content })
      })
      .catch(() => toast.error("Failed to fetch post."))
      .finally(() => setLoading(false))
  }, [postId, token])

  // Fetch reactions (likes/dislikes)
  const fetchReactions = async () => {
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/posts/${postId}/reactions`)
      if (!res.ok) return
      const data = await res.json()
      setReactions(data.reactions)
    } catch {
      toast.error("Failed to fetch likes/dislikes.")
    }
  }

  useEffect(() => {
    fetchReactions()
    // eslint-disable-next-line
  }, [postId])

  // Like/dislike handlers
  const handleReaction = async (reactionType) => {
    if (!token) {
      toast.error("You must be logged in to react.")
      return
    }
    if (reactionType === "like") setLikeLoading(true)
    if (reactionType === "dislike") setDislikeLoading(true)
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/posts/${postId}/react?reaction_type=${reactionType}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      fetchReactions()
    } catch {
      toast.error("Unable to react to post.")
    } finally {
      setLikeLoading(false)
      setDislikeLoading(false)
    }
  }

  // Fetch comments
  const fetchComments = async () => {
    setCommentsLoading(true)
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/posts/${postId}/comments`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      })
      const data = await res.json()
      setComments(data)
    } catch {
      toast.error("Could not load comments.")
    } finally {
      setCommentsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line
  }, [postId, token])

  // --- POST CRUD ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content required.")
      return
    }
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Update failed.")
      const updated = await res.json()
      setPost(updated)
      toast.success("Post updated.")
      setEditing(false)
    } catch {
      toast.error("Unable to update post.")
    }
  }

  const handleDelete = async () => {
    setDeleteOpen(false)
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      if (!res.ok) throw new Error("Delete failed.")
      toast.success("Post deleted.")
      setTimeout(() => router.push("/"), 1200)
    } catch {
      toast.error("Unable to delete post.")
    }
  }

  // --- COMMENTS CRUD ---
  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentInput.trim()) {
      toast.error("Comment cannot be empty!")
      return
    }
    setCommentAdding(true)
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ content: commentInput }),
      })
      if (!res.ok) throw new Error("Add failed.")
      setCommentInput("")
      toast.success("Comment added!")
      fetchComments()
    } catch {
      toast.error("Unable to add comment.")
    } finally {
      setCommentAdding(false)
    }
  }

  // Edit comment
  const handleStartEdit = (id, content) => {
    setCommentEditId(id)
    setCommentEditContent(content)
  }
  const handleEditComment = async (e) => {
    e.preventDefault()
    if (!commentEditContent.trim()) {
      toast.error("Comment cannot be empty!")
      return
    }
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/comments/${commentEditId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ content: commentEditContent }),
      })
      if (!res.ok) throw new Error("Edit failed.")
      toast.success("Comment updated!")
      setCommentEditId(null)
      setCommentEditContent("")
      fetchComments()
    } catch {
      toast.error("Unable to update comment.")
    }
  }

  // Delete comment logic
  const handleDeleteComment = async () => {
    setCommentDeleteOpen(false)
    try {
      const res = await fetch(`https://blog-l9cl.onrender.com/comments/${commentDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      if (!res.ok) throw new Error("Delete failed.")
      toast.success("Comment deleted!")
      setCommentDeleteId(null)
      fetchComments()
    } catch {
      toast.error("Unable to delete comment.")
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )

  if (!post)
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground">The post you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )

  const isAuthor = post.author && currentUsername && post.author === currentUsername

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="text-lg font-semibold"
                    placeholder="Enter post title..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Content</label>
                  <Textarea
                    name="content"
                    rows={12}
                    value={form.content}
                    onChange={handleChange}
                    className="min-h-[300px] resize-none"
                    placeholder="Write your post content..."
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" className="flex items-center gap-2 sm:ml-auto">
                        <Trash2 className="h-4 w-4" />
                        Delete Post
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Are you sure you want to delete this post?
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{post.author}</span>
                    </div>
                    <span className="font-medium">
  {post.created_at
    ? new Date(post.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""}
</span>

                  </div>
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base sm:text-lg">
                    {post.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center mb-8 p-4 bg-muted/30 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReaction("like")}
                    disabled={likeLoading}
                    className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-800 dark:hover:text-green-300"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {likeLoading ? "..." : reactions.likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReaction("dislike")}
                    disabled={dislikeLoading}
                    className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950 dark:hover:border-red-800 dark:hover:text-red-300"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {dislikeLoading ? "..." : reactions.dislikes}
                  </Button>
                </div>

                {isAuthor && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                    <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Post
                    </Button>
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Post
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to delete this post?
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Yes, delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3">
              <Input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1"
                disabled={commentAdding}
              />
              <Button
                type="submit"
                disabled={commentAdding || !commentInput.trim()}
                className="flex items-center gap-2 sm:w-auto w-full"
              >
                <Send className="h-4 w-4" />
                {commentAdding ? "Adding..." : "Comment"}
              </Button>
            </form>

            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <Card key={c._id} className="bg-muted/20 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-semibold text-lg text-foreground">By:{c.author}</span><br></br>
                              <span className="font-semibold text-sm text-foreground">{c.content}</span>
                           
                          </div>
                        </div>
                      </div>

                     
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
