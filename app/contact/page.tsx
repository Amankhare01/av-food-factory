"use client";

import React from "react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-center text-green-700 mb-6">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-10">
          We’d love to hear from you! Whether you’re planning a wedding, a corporate
          event, or a small gathering, the <strong>AV Food Factory</strong> team is here
          to bring the taste of Lucknow’s Nawabi hospitality to your table.
        </p>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Get in Touch</h2>
            <p className="text-gray-700">
              Have a question about our catering services? Reach out through any of
              the following:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>📍 Vikas Nagar, Lucknow, Uttar Pradesh</li>
              <li>📞 +91 73172 75160</li>
              <li>✉️ support@avfoodfactory.com</li>
              <li>🌐 www.avfoodfactory.com</li>
            </ul>
          </div>

          {/* Simple Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your event or inquiry..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
