'use client';

import { PRIVACY_EMAIL } from '@/lib/site.config';

export default function DataRequests() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-32 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4">
            Data Subject Rights
          </h1>
          <p className="text-xl text-slate-300">
            Manage your personal data and exercise your GDPR rights
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6 mb-8">
          <p className="text-slate-200">
            Under the General Data Protection Regulation (GDPR) and other
            privacy laws, you have several rights regarding your personal data.
            Use this form to submit your request, and we'll respond within 30
            days.
          </p>
        </div>

        {/* Your Rights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">
              📋 Right to Access
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Request a copy of the personal data we hold about you in a
              structured, commonly used, and machine-readable format.
            </p>
            <button
              onClick={() => {
                document
                  .getElementById('request-form')
                  ?.scrollIntoView({ behavior: 'smooth' });
                (
                  document.getElementById('request-type') as HTMLSelectElement
                ).value = 'access';
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
            >
              Submit Access Request →
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">
              🗑️ Right to Erasure
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Request deletion of your personal data, subject to certain legal
              exceptions (e.g., data needed for legal compliance).
            </p>
            <button
              onClick={() => {
                document
                  .getElementById('request-form')
                  ?.scrollIntoView({ behavior: 'smooth' });
                (
                  document.getElementById('request-type') as HTMLSelectElement
                ).value = 'deletion';
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
            >
              Submit Deletion Request →
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">
              📤 Right to Portability
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Request your personal data in a portable format so you can
              transfer it to another service provider.
            </p>
            <button
              onClick={() => {
                document
                  .getElementById('request-form')
                  ?.scrollIntoView({ behavior: 'smooth' });
                (
                  document.getElementById('request-type') as HTMLSelectElement
                ).value = 'portability';
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
            >
              Submit Portability Request →
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">
              ✏️ Right to Rectification
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Request correction of inaccurate or incomplete personal data that
              we hold about you.
            </p>
            <button
              onClick={() => {
                document
                  .getElementById('request-form')
                  ?.scrollIntoView({ behavior: 'smooth' });
                (
                  document.getElementById('request-type') as HTMLSelectElement
                ).value = 'correction';
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
            >
              Submit Correction Request →
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">
              🛑 Right to Restrict
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Request that we stop processing your personal data while a dispute
              is resolved or other conditions are met.
            </p>
            <button
              onClick={() => {
                document
                  .getElementById('request-form')
                  ?.scrollIntoView({ behavior: 'smooth' });
                (
                  document.getElementById('request-type') as HTMLSelectElement
                ).value = 'restriction';
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
            >
              Submit Restriction Request →
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">
              🚫 Right to Object
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Object to processing of your data for marketing, profiling, or
              other purposes.
            </p>
            <button
              onClick={() => {
                document
                  .getElementById('request-form')
                  ?.scrollIntoView({ behavior: 'smooth' });
                (
                  document.getElementById('request-type') as HTMLSelectElement
                ).value = 'objection';
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
            >
              Submit Objection →
            </button>
          </div>
        </div>

        {/* Request Form */}
        <div
          id="request-form"
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-12"
        >
          <h2 id="form-title" className="text-2xl font-bold text-cyan-300 mb-6">
            Submit a Data Request
          </h2>

          <form
            action={`mailto:${PRIVACY_EMAIL}`}
            method="POST"
            encType="text/plain"
            className="space-y-6"
            aria-labelledby="form-title"
          >
            {/* Request Type */}
            <div>
              <label
                htmlFor="request-type"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Type of Request *
              </label>
              <select
                id="request-type"
                name="requestType"
                aria-label="Type of GDPR request (access, deletion, portability, correction, restriction, objection, or other)"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select a request type</option>
                <option value="access">Access my data</option>
                <option value="deletion">Delete my data</option>
                <option value="portability">Export my data</option>
                <option value="correction">Correct my data</option>
                <option value="restriction">Restrict processing</option>
                <option value="objection">Object to processing</option>
                <option value="other">Other request</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">Required</p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Your Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                aria-label="Your email address for identity verification and response"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                We'll use this to verify your identity and respond to your
                request
              </p>
            </div>

            {/* Name (Optional) */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Full Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                aria-label="Your full name (optional)"
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
            </div>

            {/* Details */}
            <div>
              <label
                htmlFor="details"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Request Details
              </label>
              <textarea
                id="details"
                name="details"
                aria-label="Additional details about your request"
                rows={5}
                placeholder="Please provide any additional details about your request. For example: if you're requesting data deletion, specify what data should be deleted. If requesting correction, explain what information is inaccurate."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Optional but helpful for processing your request
              </p>
            </div>

            {/* Data Categories */}
            <fieldset>
              <legend className="block text-sm font-semibold text-slate-200 mb-3">
                Data Categories Involved
              </legend>
              <div className="space-y-2">
                {[
                  {
                    value: 'analytics',
                    label: 'First-party analytics (ViewTracker page views)',
                  },
                  {
                    value: 'google-analytics',
                    label: 'Google Analytics data (if consented)',
                  },
                  {
                    value: 'advertising',
                    label: 'Advertising data / Google AdSense (if consented)',
                  },
                  { value: 'errors', label: 'Error monitoring data (Sentry)' },
                  { value: 'cookies', label: 'Cookie preferences' },
                  { value: 'logs', label: 'Server logs (IP addresses)' },
                  { value: 'comments', label: 'Comments (Giscus/GitHub)' },
                  { value: 'all', label: 'All my data' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="dataCategories"
                      value={value}
                      className="w-4 h-4 rounded accent-cyan-500"
                    />
                    <span className="text-slate-300 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Verification */}
            <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
              <p className="text-sm text-slate-400 mb-3">
                <strong className="text-slate-200">Verification:</strong> We'll
                send a verification link to your email address. You must confirm
                your identity before we process your request.
              </p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  aria-label="I understand my request will be verified via email"
                  required
                  className="w-4 h-4 rounded accent-cyan-500"
                />
                <span className="text-slate-300 text-sm">
                  I understand my request will be verified via email
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Submit Your Data Request
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Your request is secure and will be processed in accordance with
            GDPR. You'll receive a confirmation email within 24 hours.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'How long does it take to process my request?',
                a: 'We aim to process all data requests within 30 days. Some requests may require up to 90 days if we need to verify your identity or if your request is particularly complex.',
              },
              {
                q: 'What happens if I request deletion?',
                a: 'If you request deletion, we will delete your personal data from our systems within 30 days. However, some data cannot be deleted due to legal requirements (e.g., server logs for security). We will inform you of any exceptions.',
              },
              {
                q: 'Can I download my data?',
                a: 'Yes, you can request your data in a portable format (JSON or CSV). We will provide all data we hold about you in a structured, standard format.',
              },
              {
                q: 'Will deletion affect my ability to use the site?',
                a: 'Since our website is primarily public content with minimal personal data collection, deletion will mainly affect analytics and personalization. You can continue to browse the site normally.',
              },
              {
                q: 'What if I disagree with your response?',
                a: 'You have the right to lodge a complaint with your local data protection authority if you believe we have not properly handled your request.',
              },
              {
                q: 'Is my request confidential?',
                a: 'Yes. Your request and personal information are handled confidentially and securely. We do not share your request details with third parties.',
              },
            ].map(({ q, a }, idx) => (
              <details
                key={idx}
                className="group bg-slate-800/50 border border-slate-700 rounded-lg p-4 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-slate-200 group-open:text-cyan-300">
                  {q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-slate-400 text-sm mt-4">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-cyan-300 mb-4">
            Need Help?
          </h3>
          <p className="text-slate-300 mb-4">
            For questions about your data rights or if you need assistance with
            your request:
          </p>
          <ul className="space-y-2 text-slate-400">
            <li>
              📧 <strong>Email:</strong>{' '}
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="text-cyan-400 hover:text-cyan-300"
              >
                {PRIVACY_EMAIL}
              </a>
            </li>
            <li>
              📋 <strong>For Privacy Policy questions:</strong>{' '}
              <a
                href="/legal/privacy"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Read our Privacy Policy
              </a>
            </li>
            <li>
              🍪 <strong>For Cookie questions:</strong>{' '}
              <a
                href="/legal/cookie-policy"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Read our Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
