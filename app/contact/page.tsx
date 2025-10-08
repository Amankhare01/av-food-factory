"use client";

import { FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";

export default function ContactPage() {
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
        </div>

        {/* RIGHT CARD — Form */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <form className="space-y-5">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp / Phone</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <input
                  type="text"
                  placeholder="Wedding, Corporate, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium mb-1">Event Location</label>
              <input
                type="text"
                placeholder="Venue / City"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
              />
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-sm font-medium mb-1">Message / Menu Details</label>
              <textarea
                rows={4}
                placeholder="Tell us your menu preferences or any special requests..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f766e] outline-none"
              ></textarea>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" required />
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
              className="w-full bg-nawab-emerald text-white font-medium py-2.5 rounded-lg shadow hover:bg-nawab-emeraldDeep transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
