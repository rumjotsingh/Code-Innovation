import { Button } from "@/components/ui/button"; // Optional: for subscribe/social
import { Separator } from "@/components/ui/separator"; // Optional, for visual dividers

export function Footer() {
  return (
    <footer className="w-full bg-zinc-900 text-zinc-200">
      <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8 md:gap-0 justify-between">

        <div>
          <div className="font-bold text-xl mb-2">Code & Innovation</div>
          <p className="text-zinc-400 max-w-xs">
            Inspiring stories & resources for creative minds.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <div className="font-semibold mb-1">Links</div>
            <ul className="space-y-1">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
             
              <li><a href="/about" className="hover:text-white transition">About</a></li>
              <li><a href="/Contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1">Resources</div>
            <ul className="space-y-1">
              <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
         
        </div>
      </div>
      <Separator className="bg-zinc-800 my-4" />
      <div className="text-sm text-zinc-500 text-center pb-4">
        &copy; {new Date().getFullYear()} Code & Innovation. All rights reserved.
      </div>
    </footer>
  );
}
