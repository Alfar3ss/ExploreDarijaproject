"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | "success" | "error" | "loading">(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.from("contacts").insert([{ name, email, message }]);
    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>
      <p className="text-gray-700 mb-4">
        Have questions or feedback? Drop us a message at{" "}
        <a href="mailto:contact@exploredarija.com" className="text-primary">
          contact@exploredarija.com
        </a>.
      </p>
      <div className="mt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 block w-full border rounded-md px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 block w-full border rounded-md px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              className="mt-1 block w-full border rounded-md px-3 py-2"
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send"}
          </button>
          {status === "success" && (
            <div className="text-green-600 mt-2">Message sent! Thank you.</div>
          )}
          {status === "error" && (
            <div className="text-red-600 mt-2">Error sending message. Please try again.</div>
          )}
        </form>
      </div>
    </main>
  );
}