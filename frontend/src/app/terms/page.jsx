import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
      <Separator className="mb-6" />

      <p className="text-zinc-700 dark:text-zinc-300 mb-6">
        By accessing and using the Code & Innovation website, you agree to the following terms and conditions.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Use of Website</h2>
        <ul className="list-disc pl-6 space-y-1 text-zinc-700 dark:text-zinc-300">
          <li>Content is for informational purposes only.</li>
          <li>Do not attempt to exploit, hack, or misuse the website in any way.</li>
          <li>You may not reproduce or republish any content without consent.</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Accounts</h2>
        <p>
          If you create an account, you are responsible for all activities that occur under your account.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Disclaimer &amp; Liability</h2>
        <ul className="list-disc pl-6 space-y-1 text-zinc-700 dark:text-zinc-300">
          <li>BlogName is not liable for any damages from website use.</li>
          <li>The site may contain errors or inaccuracies.</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Changes</h2>
        <p>
          We may update these terms from time to time. Changes take effect upon being published on this page.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>
          If you have any questions, contact us at 
          <a href="/Contact" className="underline ml-1 text-blue-600 dark:text-blue-400">our contact page</a>.
        </p>
      </section>
      <Separator className="my-6" />
      <div className="text-zinc-600 dark:text-zinc-400">
        Last updated: {new Date().getFullYear()}.
      </div>
    </main>
  );
}
