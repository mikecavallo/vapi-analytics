import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Phone, MessageCircle, Users, Zap, Shield, Building2, Heart, DollarSign, Home as HomeIcon, Plane, ShoppingCart, CheckCircle, Mic, PhoneCall, Mail, Calendar, CreditCard, Database, Bot, BarChart3, Bell, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from '@/components/layout/public-navbar';

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            >
              Voice AI Use Cases
              <br />by Industry
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-cyan-100 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              See how leaders automate support, scheduling, and follow-ups across insurance, healthcare, finance, and more.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Core Voice AI Applications */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Core Voice AI Applications
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From inbound support to outbound campaigns, our AI handles every voice interaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Voice AI Agents */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                  Voice AI Agents
                </CardTitle>
                <CardDescription>
                  24/7 intelligent call handling and customer interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    24/7 AI receptionists for inbound calls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Lead qualification before human transfer
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automated appointment booking & rescheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Outbound follow-up & reminder calls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Post-service satisfaction surveys
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Messaging AI */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                  Messaging AI
                </CardTitle>
                <CardDescription>
                  Intelligent SMS and email automation workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instant follow-up when forms submitted
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Appointment reminders & confirmations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Payment reminders with embedded links
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Abandoned cart recovery campaigns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Customer satisfaction surveys
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Integration Automations */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-green-600" />
                  CRM & Integrations
                </CardTitle>
                <CardDescription>
                  Seamless workflow automation across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Auto lead creation from web forms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Call outcomes synced to CRM notes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automatic ticket creation in Zendesk
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Lead scoring from conversation data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Invoice triggering after successful calls
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industry-Specific Use Cases */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Industry-Specific Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tailored voice AI implementations for your industry's unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Insurance */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Insurance
                </CardTitle>
                <CardDescription>
                  Streamline policy management and customer communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• AI pre-qualifier for policy quotes</li>
                  <li>• Automated renewal reminders via SMS/call/email</li>
                  <li>• Claims intake via AI voice bot</li>
                  <li>• Compliance-friendly call scripts</li>
                  <li>• Policy lapse prevention campaigns</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Real Result:</strong> Agency reduced policy lapses with automated payment reminders and birthday/holiday relationship building
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Healthcare */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-600" />
                  Healthcare
                </CardTitle>
                <CardDescription>
                  Enhance patient care and reduce administrative burden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Appointment scheduling & reminders</li>
                  <li>• Prescription refill notifications</li>
                  <li>• Patient intake forms via AI calls/texts</li>
                  <li>• Post-visit follow-up surveys</li>
                  <li>• No-show reduction automation</li>
                </ul>
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    <strong>Real Result:</strong> Medical practice reduced no-shows with automated reminders and rescheduling links
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Finance */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Finance
                </CardTitle>
                <CardDescription>
                  Secure financial services automation and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Loan application intake calls</li>
                  <li>• Payment reminders & collection flows</li>
                  <li>• Account verification automations</li>
                  <li>• Fraud alert notifications</li>
                  <li>• Credit score improvement guidance</li>
                </ul>
              </CardContent>
            </Card>

            {/* Real Estate */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <HomeIcon className="w-6 h-6 text-orange-600" />
                  Real Estate
                </CardTitle>
                <CardDescription>
                  Accelerate lead conversion and property management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Auto-response to property inquiries</li>
                  <li>• Appointment scheduling for showings</li>
                  <li>• Mortgage pre-qualification via AI bot</li>
                  <li>• Tenant maintenance request handling</li>
                  <li>• Lead qualification & warm transfers</li>
                </ul>
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    <strong>Real Result:</strong> Brokerage increased lead response time from hours to minutes with instant qualification
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hospitality/Travel */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Plane className="w-6 h-6 text-purple-600" />
                  Hospitality & Travel
                </CardTitle>
                <CardDescription>
                  Enhance guest experience and operational efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Reservation confirmations</li>
                  <li>• Pre-check-in instructions</li>
                  <li>• Flight delay/cancellation notifications</li>
                  <li>• Guest satisfaction surveys</li>
                  <li>• Concierge service automation</li>
                </ul>
              </CardContent>
            </Card>

            {/* Retail/E-Commerce */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-indigo-600" />
                  Retail & E-Commerce
                </CardTitle>
                <CardDescription>
                  Boost sales and customer retention automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Abandoned cart recovery calls/SMS</li>
                  <li>• Order/shipping status updates</li>
                  <li>• Warranty claim automation</li>
                  <li>• Customer loyalty program reminders</li>
                  <li>• Product setup guidance calls</li>
                </ul>
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    <strong>Real Result:</strong> E-commerce store improved customer service with AI chat for FAQs and upset customer escalation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* White-Glove Service Menu */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              White-Glove Service Menu
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete voice AI implementation with full-service support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Voice AI Services */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  Voice AI Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Inbound AI Fronter</li>
                  <li>• Outbound AI Fronter</li>
                  <li>• Warm Transfer Setup</li>
                  <li>• Voicemail Drops</li>
                  <li>• Call Recording & QA</li>
                </ul>
              </CardContent>
            </Card>

            {/* Messaging AI */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  Messaging AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• SMS Automations</li>
                  <li>• Email Automations</li>
                  <li>• Direct Mail Triggers</li>
                  <li>• 2-way Texting</li>
                  <li>• Drip Campaigns</li>
                </ul>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• CRM Integration</li>
                  <li>• Dialer Integration</li>
                  <li>• Calendar & Booking</li>
                  <li>• Payment Systems</li>
                  <li>• Database Sync</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  Analytics & Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Transcription & Summarization</li>
                  <li>• Sentiment Analysis</li>
                  <li>• Performance Dashboards</li>
                  <li>• Automated Alerts</li>
                  <li>• Success Metrics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Implement Voice AI for Your Industry?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Get a custom implementation plan designed for your specific business needs and industry requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-demo">
              <Button size="lg" className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700" data-testid="button-book-demo">
                Schedule Industry Demo
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/assistant-studio">
              <Button size="lg" variant="outline" data-testid="button-try-studio">
                Try Assistant Studio
                <Settings className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}