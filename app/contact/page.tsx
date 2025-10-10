"use client";

import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaClock, FaWhatsapp } from "react-icons/fa";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    type: "",
    location: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      alert("Please fill your name and contact number before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("✅ Thank you! Your details have been sent successfully.");
        setForm({
          name: "",
          phone: "",
          date: "",
          type: "",
          location: "",
          message: "",
        });
      } else {
        alert("❌ Failed to send email. Please try again later.");
      }
    } catch (err) {
      alert("⚠️ Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#faf6f1] py-16 px-6 md:px-12 lg:px-24">
      <div className="mt-[100px] max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        {/* LEFT CARD — Info */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-4xl font-bold mb-6">
            Contact <span className="text-[#0f766e]">Us</span>
          </h2>

          <ul className="space-y-4 text-gray-700">
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-[#0f766e]" />
              <span>support@avfoodfactory.com</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-[#0f766e]" />
              <span>+91 78805 61870</span>
            </li>
            <li className="flex items-center gap-3">
              <FaClock className="text-[#0f766e]" />
              <span>Mon–Sat • 9am–8pm IST</span>
            </li>
          </ul>

          <div className="mt-8 border border-[#0f766e]/30 rounded-xl p-5 bg-[#fffdf9]">
            <h3 className="font-semibold text-gray-800 mb-3">
              For the best catering experience:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>Share your event date, time, and guest count.</li>
              <li>Let us know your menu preferences or cuisine theme.</li>
              <li>We’ll respond quickly with a tailored quote.</li>
            </ul>
          </div>

          {/* WhatsApp Shortcut (optional) */}
          <a
            href="https://wa.me/917880561870?text=Hello%20AV%20Food%20Factory!%20I%27d%20like%20to%20discuss%20catering%20for%20my%20event."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full hover:scale-105 transition-transform"
          >
            <FaWhatsapp className="text-xl" /> Chat on WhatsApp
          </a>
        </div>

        {/* RIGHT CARD — Form */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Date
                </label>
                <input
                title="Date"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Type
                </label>
                <input
                  type="text"
                  placeholder="Wedding, Corporate, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Location
              </label>
              <input
                type="text"
                placeholder="Venue / City"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Message / Menu Details
              </label>
              <textarea
                rows={4}
                placeholder="Tell us your menu preferences or any special requests..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
              ></textarea>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-2">
              <input title="Date" type="checkbox" className="mt-1" required />
              <p className="text-sm text-gray-600">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="underline decoration-transparent hover:decoration-[#0f766e]"
                >
                  Terms
                </a>{" "}
                &{" "}
                <a
                  href="/privacy"
                  className="underline decoration-transparent hover:decoration-[#0f766e]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f766e] text-white font-medium py-2.5 rounded-lg shadow hover:bg-[#115e59] transition disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
