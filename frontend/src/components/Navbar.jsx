'use client';

import { useContext, useState } from "react";
import { AuthContext } from "../context/authcontext";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react"; // lightweight icons

export function Navbar() {
  const router = useRouter();
  const { token, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full max-w-[1280px] border-b bg-white dark:bg-zinc-900">
      <div className="flex items-center h-14 px-4 justify-between w-full">
        {/* Logo/Brand */}
        <div className="font-bold text-2xl">
          <a href="/" className="px-4 py-2 text-gray-900 dark:text-gray-100">
            Code & Innovation
          </a>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-2">
          {token ? (
            <>
              <li>
                <a
                  href="/profile"
                  className="px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                >
                  Profile
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/posts");
                  }}
                  className="px-2 text-gray-700 hover:text-black dark:text-gray-200"
                >
                  Create Post
                </button>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="px-2 text-gray-700 hover:text-black dark:text-gray-200"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                >
                  Register
                </a>
              </li>
            </>
          )}
          <li>
            <a
              href="/Contact"
              className="px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
            >
              Contact
            </a>
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-900 dark:text-gray-100"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-t animate-slide-down">
          <ul className="flex flex-col gap-2 p-4">
            {token ? (
              <>
                <li>
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/posts");
                    }}
                    className="block px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                  >
                    Create Post
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="block px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a
                    href="/login"
                    className="block px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="/register"
                    className="block px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
                  >
                    Register
                  </a>
                </li>
              </>
            )}
            <li>
              <a
                href="/Contact"
                className="block px-4 py-2 text-gray-700 hover:text-black dark:text-gray-200"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
