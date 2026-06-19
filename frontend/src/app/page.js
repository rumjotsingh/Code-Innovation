"use client";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { AuthContext } from "../context/authcontext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, ArrowRight, BookOpen } from "lucide-react";

export default function BlogListPage() {
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://blog-l9cl.onrender.com/posts")
      .then((res) => res.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Posts Grid Skeleton */}
          <div className="grid gap-6 md:gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (!posts.length)
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6   rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No posts yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            It looks like there aren&#39;t any blog posts available right now.
            Check back later for fresh content!
          </p>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className=" mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Latest Posts
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover insights, stories, and ideas from our community of writers
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 md:gap-8 max-w-4xl mx-auto">
          {posts.map((post, index) => (
            <article
              key={post._id}
              className="group bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
            >
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {token ? (
                    <Link href={`/posts/${post._id}`} className="block">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {post.title}
                    </h2>
                  )}

                  {/* Meta Info */}
                </div>
              </div>

              {/* Content Excerpt */}
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-base sm:text-lg">
                {post.content.length > 150
                  ? post.content.slice(0, 150) + "..."
                  : post.content}
              </p>

              {/* Action Area */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {token ? (
                  <Button asChild className="w-fit">
                    <Link href={`/posts/${post._id}`}>
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Login required to read full post
                      </span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/login">
                        Login to Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Load More Section */}
      </div>
    </div>
  );
}
