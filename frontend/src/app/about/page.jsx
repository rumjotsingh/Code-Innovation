import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">About Us</h1>
      <Separator className="mb-6" />
      <section className="mb-8">
        <p className="text-zinc-700 dark:text-zinc-300 mb-4">
          Welcome to <span className="font-semibold">Code & Innovation</span>!<br /><br />
          Our mission is to inspire, inform, and connect people through thoughtful stories, expert insights, and practical guides. We believe in the power of words to spark creativity and foster learning in a fast-changing world.
        </p>
        <p className="text-zinc-700 dark:text-zinc-300 mb-4">
          Founded in 2025, Code & Innovation started as a small project among passionate writers and technologists. Since then, we've grown into a trusted resource for thousands of readers worldwide. Whether you're here for deep dives on technology, creative writing, or lifestyle tips, we aim to deliver high-quality, well-researched content you can rely on.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
          <li>Original blog posts from subject-matter experts</li>
          <li>Responsive, accessible UI and intuitive user experience</li>
          <li>Regular updates on new topics in technology, creativity, and lifestyle</li>
          <li>Interactive features—comments, feedback, and community connections</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Meet the Team</h2>
        <p className="text-zinc-700 dark:text-zinc-300 mb-2">
          Our team includes experienced writers, designers, and engineers passionate about building impactful digital products. We constantly strive to improve how information is shared and consumed online.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          Have a question, suggestion, or partnership idea? 
          <a href="/Contact" className="underline ml-1 text-blue-600 dark:text-blue-400">Contact us here.</a>
        </p>
      </section>
      <Separator className="mt-8 mb-6" />
      <div className="text-zinc-600 dark:text-zinc-400 text-sm">
        &copy; {new Date().getFullYear()} Code & Innovation. Built by creators, for readers.
      </div>
    </main>
  );
}
