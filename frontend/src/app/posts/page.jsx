"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { PenTool, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function NewPostPage() {
  const [form, setForm] = useState({ title: "", content: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  // Validation and submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.")
      return
    }

    setLoading(true)
    try {
      const auth = JSON.parse(localStorage.getItem("auth"))
      const res = await fetch("https://blog-l9cl.onrender.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth?.token ? `Bearer ${auth.token}` : undefined,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Unable to add post.")

      setSuccess("Post created successfully!")
      toast.success("Post added successfully!")
      setForm({ title: "", content: "" })
      setTimeout(() => router.push("/"), 1200)
    } catch {
      setError("Failed to create post. Please try again.")
      toast.error("Failed to create post.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PenTool className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Create New Post
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Share your thoughts with the world
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Post Title
              </Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter an engaging title for your post..."
                required
                className="h-12 text-base border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={12}
                placeholder="Write your blog content here... Share your ideas, experiences, or insights with your readers."
                required
                className="text-base border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">{form.content.length} characters</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing Post...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
