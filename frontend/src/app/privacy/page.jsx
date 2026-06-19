import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <Separator className="mb-6" />
      <p className="text-zinc-700 dark:text-zinc-300 mb-6">
        Your privacy is important to us. This Privacy Policy describes how Code & Innovation collects, uses, and protects your personal information.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-1 text-zinc-700 dark:text-zinc-300">
          <li>Personal identification information (Name, email, etc.)</li>
          <li>Usage data (pages visited, devices/sessions)</li>
          <li>Cookies and tracking technologies</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
        <ul className="list-disc pl-6 space-y-1 text-zinc-700 dark:text-zinc-300">
          <li>To improve your experience on our website</li>
          <li>To send periodic emails and updates (only if you consent)</li>
          <li>To analyze website usage and performance</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
        <p>
          You can access, correct, or delete your personal information. Contact us at <a href="/Contact" className="underline text-blue-600 dark:text-blue-400">our contact page</a>.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Updates</h2>
        <p>
          We may update this policy occasionally. The latest version will always be published on this page.
        </p>
      </section>

      <Separator className="mb-6" />
      <div className="text-zinc-600 dark:text-zinc-400">
        Last updated: {new Date().getFullYear()}.
      </div>
    </main>
  );
}
