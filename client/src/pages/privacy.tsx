import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-cyan-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">I</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Invoxa.ai</span>
                </div>
              </Link>
            </div>
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: March 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">

          <section>
            <p>
              Invoxa.ai ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at invoxa.ai or use our AI-powered voice and messaging services (collectively, the "Services").
            </p>
            <p className="mt-4">
              Please read this policy carefully. If you disagree with its terms, please discontinue use of our Services. By accessing or using our Services, you agree to this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact information (name, email address, phone number, company name)</li>
              <li>Account credentials when you register for our platform</li>
              <li>Billing and payment information processed through secure third-party payment processors</li>
              <li>Communications you send us, including support requests and demo inquiries</li>
              <li>Configuration data for AI agents and workflows you create</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Log data including IP address, browser type, pages visited, and time spent</li>
              <li>Device information including hardware model and operating system</li>
              <li>Cookies and similar tracking technologies (see Section 5)</li>
              <li>Usage analytics to understand how our Services are used</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Call and Communication Data</h3>
            <p>
              When you use our voice AI and messaging services, we may process call recordings, transcripts, and conversation data on your behalf as a data processor. This data is used solely to provide the Services and is governed by our Data Processing Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, operate, and maintain our Services</li>
              <li>Process transactions and send related information including confirmations and invoices</li>
              <li>Respond to comments, questions, and support requests</li>
              <li>Send technical notices, updates, security alerts, and administrative messages</li>
              <li>Monitor and analyze usage trends to improve our Services</li>
              <li>Detect, prevent, and address fraudulent or illegal activities</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (you may opt out at any time)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Sharing of Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, payment processing, analytics, customer support)</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of all or a portion of our assets</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, or other legal process, or to protect the rights, property, or safety of Invoxa.ai, our clients, or others</li>
              <li><strong>With Your Consent:</strong> In any other circumstances with your prior consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Retention</h2>
            <p>
              We retain personal information for as long as necessary to provide our Services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Call recordings and transcripts are retained according to your account settings and applicable legal requirements. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Services and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="mt-4">We use the following types of cookies:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Essential Cookies:</strong> Required for the Services to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Services (e.g., Google Analytics)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
            <p className="mt-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Services. To opt out of Google Analytics tracking, visit <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, access controls, and regular security assessments.
            </p>
            <p className="mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to certain exceptions</li>
              <li><strong>Portability:</strong> Request transfer of your personal information to another service</li>
              <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
              <li><strong>Opt-Out of Marketing:</strong> Unsubscribe from marketing emails at any time using the unsubscribe link or by contacting us</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, please contact us at <a href="mailto:info@invoxa.ai" className="text-blue-600 hover:underline">info@invoxa.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. California Privacy Rights (CCPA)</h2>
            <p>
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA). You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Know what personal information we collect about you and how it is used and shared</li>
              <li>Delete personal information we collected from you (with certain exceptions)</li>
              <li>Opt-out of the sale of your personal information (we do not sell personal information)</li>
              <li>Non-discrimination for exercising your CCPA rights</li>
            </ul>
            <p className="mt-4">
              To submit a CCPA request, contact us at <a href="mailto:info@invoxa.ai" className="text-blue-600 hover:underline">info@invoxa.ai</a> or call <a href="tel:8777701332" className="text-blue-600 hover:underline">(877) 770-1332</a>. We will respond within 45 days of receiving your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
            <p>
              Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Third-Party Links</h2>
            <p>
              Our Services may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated date and, where appropriate, by email. Your continued use of the Services after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="mt-4 space-y-1">
              <p><strong>Invoxa.ai</strong></p>
              <p>Email: <a href="mailto:info@invoxa.ai" className="text-blue-600 hover:underline">info@invoxa.ai</a></p>
              <p>Phone: <a href="tel:8777701332" className="text-blue-600 hover:underline">(877) 770-1332</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
