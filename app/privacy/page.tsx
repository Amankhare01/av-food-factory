"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-16 px-6 md:px-20 lg:px-40">
      <div className="max-w-5xl mx-auto rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-center text-green-700 mb-6">
          Privacy Policy
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Effective Date: {new Date().getFullYear()}
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p>
              Welcome to <strong>AV Food Factory</strong> (“we,” “our,” or
              “us”). At AV Food Factory, accessible at{" "}
              <a
                href="https://www.avfoodfactory.com"
                className="text-green-700 underline"
              >
                www.avfoodfactory.com
              </a>
              , we value your trust and are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard
              your information when you use our catering services in Lucknow.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, email address, phone
                number, billing and delivery address, and event details.
              </li>
              <li>
                <strong>Order Information:</strong> Food preferences, menu
                selections, dietary requirements, and booking details.
              </li>
              <li>
                <strong>Technical Information:</strong> IP address, browser type,
                and cookies to improve user experience.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and deliver catering orders efficiently.</li>
              <li>To communicate with you regarding bookings, changes, or updates.</li>
              <li>To provide customer support and address inquiries.</li>
              <li>
                To improve our website, menu options, and overall service
                experience.
              </li>
              <li>
                To comply with legal obligations and prevent fraudulent
                activities.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Sharing of Information</h2>
            <p>
              We do not sell or rent your personal data to third parties. We may
              share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> Trusted vendors helping us
                with deliveries, payments, or IT support.
              </li>
              <li>
                <strong>Legal Authorities:</strong> When required by law or to
                protect our rights and safety.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies & Tracking</h2>
            <p>
              Our website may use cookies to enhance your browsing experience,
              analyze traffic, and personalize services. You can disable cookies
              in your browser settings, but some features may not function
              properly without them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              information. However, no online transmission is 100% secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal information.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Opt out of promotional communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Third-Party Links</h2>
            <p>
              Our website may contain links to third-party sites. We are not
              responsible for the privacy practices or content of those sites and
              encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated “Effective Date.” We
              encourage you to review it periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please
              contact us at:
            </p>
            <div className="mt-2">
              <p>
                <strong>AV Food Factory</strong>
              </p>
              <p>Email: support@avfoodfactory.com</p>
              <p>Phone: +91 73172 75160</p>
              <p>Lucknow, Uttar Pradesh, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
