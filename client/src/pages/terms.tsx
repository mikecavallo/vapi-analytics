import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: March 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">

          <section>
            <p>
              These Terms and Conditions ("Terms") govern your access to and use of the website, platform, and services provided by Invoxa.ai ("Company," "we," "us," or "our"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"Services"</strong> means the AI-powered voice agent, messaging automation, analytics platform, and related services provided by Invoxa.ai.</li>
              <li><strong>"Client"</strong> or <strong>"you"</strong> means any individual or entity that accesses or uses the Services.</li>
              <li><strong>"Platform"</strong> means the Invoxa.ai web application and associated software.</li>
              <li><strong>"Content"</strong> means any data, text, audio, or other materials processed through the Services.</li>
              <li><strong>"Agreement"</strong> means these Terms together with any applicable order forms, statements of work, or separate agreements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Acceptance of Terms</h2>
            <p>
              By creating an account, signing an order form, or otherwise accessing our Services, you represent that: (a) you are at least 18 years of age; (b) you have the authority to bind yourself or the organization you represent; and (c) you have read and agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Scope of Services</h2>
            <p>
              Invoxa.ai provides AI-powered voice agents, automated messaging workflows, CRM integrations, analytics dashboards, and related implementation and support services. The specific services provided to you are described in your applicable order form or statement of work.
            </p>
            <p className="mt-4">
              We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time with reasonable notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Account Registration and Security</h2>
            <p>
              To access certain features of our Services, you must create an account. You agree to provide accurate, current, and complete information and to update such information as necessary. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at <a href="mailto:info@invoxa.ai" className="text-blue-600 hover:underline">info@invoxa.ai</a> if you suspect unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Fees and Payment</h2>
            <p>
              Fees for the Services are set forth in your applicable order form or as listed on our website. Unless otherwise specified:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Fees are due in advance and are non-refundable except as expressly stated herein</li>
              <li>We may modify fees with 30 days' written notice for subscription services</li>
              <li>You are responsible for all applicable taxes, levies, or duties imposed by taxing authorities</li>
              <li>Overdue payments are subject to a late fee of 1.5% per month or the maximum permitted by law</li>
              <li>We reserve the right to suspend Services for accounts more than 30 days past due</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Acceptable Use</h2>
            <p>You agree not to use the Services to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Violate any applicable law, regulation, or third-party rights</li>
              <li>Transmit unsolicited communications or engage in spamming</li>
              <li>Violate the Telephone Consumer Protection Act (TCPA) or other telecommunications laws</li>
              <li>Harass, abuse, or harm any individual</li>
              <li>Transmit malicious code, viruses, or harmful data</li>
              <li>Attempt to gain unauthorized access to our systems or other clients' data</li>
              <li>Reverse engineer, decompile, or disassemble any aspect of the Services</li>
              <li>Use the Services to compete with or develop a competing product</li>
            </ul>
            <p className="mt-4">
              We reserve the right to terminate your access immediately for violations of this section.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
            <p>
              The Services, including all software, algorithms, designs, text, graphics, and other content, are owned by Invoxa.ai and protected by intellectual property laws. These Terms do not grant you any rights in or to our intellectual property other than the limited license to use the Services as described herein.
            </p>
            <p className="mt-4">
              You retain all ownership rights in your Content. By providing Content through the Services, you grant us a limited license to process such Content solely to provide the Services to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Confidentiality</h2>
            <p>
              Each party agrees to maintain the confidentiality of the other party's non-public information disclosed in connection with the Services. "Confidential Information" does not include information that: (a) is or becomes publicly known through no breach of these Terms; (b) was rightfully known before disclosure; (c) is independently developed without use of confidential information; or (d) is required to be disclosed by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Data Privacy and Security</h2>
            <p>
              Our collection and use of personal information is governed by our Privacy Policy, incorporated herein by reference. For clients who use the Services to process personal data on behalf of their customers, a separate Data Processing Agreement may be required. We implement industry-standard security measures to protect data processed through the Services.
            </p>
            <p className="mt-4">
              You are responsible for ensuring that your use of the Services complies with all applicable privacy laws, including obtaining necessary consents from individuals whose data you process through the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Telecommunications Compliance</h2>
            <p>
              You acknowledge that your use of voice AI and messaging services is subject to applicable telecommunications regulations, including but not limited to the TCPA, the CAN-SPAM Act, and state telemarketing laws. You represent and warrant that you have obtained all required consents before initiating AI-powered calls or messages to any individual. You agree to maintain and honor opt-out requests and do-not-call lists as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Disclaimers and Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            <p className="mt-4">
              We do not warrant that: (a) the Services will function uninterrupted or error-free; (b) any errors in the Services will be corrected; (c) AI-generated content will be accurate or suitable for any particular purpose; or (d) the Services will meet your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL INVOXA.AI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="mt-4">
              OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF (A) THE FEES PAID BY YOU IN THE THREE MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED DOLLARS ($100).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Invoxa.ai and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Services; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) your violation of any applicable law or regulation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Term and Termination</h2>
            <p>
              These Terms are effective until terminated. Either party may terminate the agreement: (a) for convenience with 30 days' written notice; or (b) immediately upon written notice if the other party materially breaches these Terms and fails to cure such breach within 15 days of notice.
            </p>
            <p className="mt-4">
              Upon termination, your right to access the Services ceases immediately. We will provide you with reasonable access to export your data for 30 days following termination. Sections that by their nature should survive termination will survive, including but not limited to Sections 7, 8, 12, 13, and 15.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">15. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of the State of Florida, without regard to its conflict of law provisions. Any dispute arising under these Terms shall first be subject to good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration under the rules of the American Arbitration Association.
            </p>
            <p className="mt-4">
              You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">16. General Provisions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and any applicable order forms, constitute the entire agreement between the parties.</li>
              <li><strong>Amendments:</strong> We may update these Terms at any time. Continued use of the Services after notice of changes constitutes acceptance.</li>
              <li><strong>Waiver:</strong> Failure to enforce any provision of these Terms does not constitute a waiver of that right.</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full force.</li>
              <li><strong>Assignment:</strong> You may not assign these Terms without our prior written consent. We may assign our rights and obligations without restriction.</li>
              <li><strong>Force Majeure:</strong> Neither party is liable for delays or failures in performance caused by circumstances beyond their reasonable control.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">17. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
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
