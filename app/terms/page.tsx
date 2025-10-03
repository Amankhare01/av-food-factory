"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-6 md:px-20 lg:px-40">
      <div className="max-w-5xl mx-auto rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-center text-green-700 mb-6">
          Terms & Conditions
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Effective Date: {new Date().getFullYear()}
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p>
              Welcome to <strong>AV Food Factory</strong> (“Company,” “we,”
              “our,” or “us”). These Terms & Conditions govern your use of our
              website{" "}
              <a
                href="https://www.avfoodfactory.com"
                className="text-green-700 underline"
              >
                www.avfoodfactory.com
              </a>{" "}
              and our catering services in Lucknow. By booking our services or
              using our website, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Services</h2>
            <p>
              AV Food Factory provides food catering for personal, corporate,
              and special events. Menu selections, availability, and pricing may
              vary depending on the season, event type, and order size.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Bookings & Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Bookings must be confirmed at least <strong>48 hours</strong> in
                advance unless otherwise agreed.
              </li>
              <li>
                Advance payment or deposit may be required to secure your
                booking.
              </li>
              <li>
                Full payment must be made before or on the day of service,
                unless prior arrangements are agreed upon.
              </li>
              <li>
                Accepted payment methods include UPI, bank transfer, and cash
                (details provided at the time of booking).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Cancellations & Refunds</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Cancellations made more than 24 hours before the event may be
                eligible for a partial refund (excluding advance booking fees).
              </li>
              <li>
                Cancellations made less than 24 hours before the event are
                non-refundable.
              </li>
              <li>
                In case of unforeseen circumstances (e.g., natural disasters,
                government restrictions), we will work with you to reschedule or
                provide an appropriate solution.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Customer Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Provide accurate event details, including date, time, location,
                and number of guests.
              </li>
              <li>
                Inform us of any food allergies or dietary restrictions at the
                time of booking.
              </li>
              <li>
                Ensure suitable arrangements at the venue for food setup,
                serving, and cleanup.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Liability</h2>
            <p>
              While we take all reasonable precautions to ensure food safety and
              quality, AV Food Factory is not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Reactions due to undisclosed allergies or dietary restrictions.
              </li>
              <li>
                Delays or service interruptions caused by factors beyond our
                control (traffic, weather, strikes, etc.).
              </li>
              <li>
                Damages or losses resulting from the actions of guests or third
                parties at your event.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
            <p>
              All content on{" "}
              <a
                href="https://www.avfoodfactory.com"
                className="text-green-700 underline"
              >
                www.avfoodfactory.com
              </a>{" "}
              including text, images, and branding, is the property of AV Food
              Factory. You may not reproduce or distribute this content without
              written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms & Conditions
              at any time. Updated terms will be posted on this page, and
              continued use of our services indicates your acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of India, and
              any disputes will be subject to the jurisdiction of the courts in
              Lucknow, Uttar Pradesh.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p>
              For any questions or concerns about these Terms & Conditions,
              please contact us:
            </p>
            <div className="mt-2">
              <p>
                <strong>AV Food Factory</strong>
              </p>
              <p>Email: support@avfoodfactory.com</p>
              <p>Phone: +91-73172-75160</p>
              <p>Lucknow, Uttar Pradesh, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
