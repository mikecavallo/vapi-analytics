import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Monitor, BarChart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from '@/components/layout/public-navbar';

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
              Invoxa.ai Dashboard—
              <br />Real-Time Voice AI Control
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-cyan-100 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Monitor calls, analyze outcomes, and optimize agents in one unified command center.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Core Dashboard Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Visibility Into Your Voice AI Operations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From real-time monitoring to deep analytics, control every aspect of your AI implementation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Call Monitoring */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Monitor className="w-6 h-6 text-blue-600" />
                  Real-time Call Monitoring
                </CardTitle>
                <CardDescription>
                  Live visibility into all voice AI interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Active call dashboard with live status</li>
                  <li>• Queue monitoring and wait times</li>
                  <li>• Agent performance metrics</li>
                  <li>• Escalation alerts and notifications</li>
                  <li>• Real-time conversation transcripts</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Conversation Analytics */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart className="w-6 h-6 text-purple-600" />
                  Conversation Analytics
                </CardTitle>
                <CardDescription>
                  Deep insights into every customer interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Automated call transcription & summarization</li>
                  <li>• Sentiment analysis and emotion detection</li>
                  <li>• Intent recognition and topic modeling</li>
                  <li>• Call outcome tracking and conversion rates</li>
                  <li>• Customer satisfaction scoring</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Assistant Studio */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-green-600" />
                  Assistant Studio
                </CardTitle>
                <CardDescription>
                  No-code AI agent creation and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Drag-and-drop conversation flow builder</li>
                  <li>• Natural language prompt engineering</li>
                  <li>• Voice and personality customization</li>
                  <li>• A/B testing for optimal performance</li>
                  <li>• One-click deployment to production</li>
                </ul>
              </CardContent>
            </Card>

            {/* Performance Dashboards */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart className="w-6 h-6 text-orange-600" />
                  Performance Dashboards
                </CardTitle>
                <CardDescription>
                  Executive-level insights and KPI tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Customizable KPI dashboards</li>
                  <li>• ROI and cost-per-conversation metrics</li>
                  <li>• Lead generation and conversion funnels</li>
                  <li>• Agent utilization and efficiency reports</li>
                  <li>• White-label reporting for clients</li>
                </ul>
              </CardContent>
            </Card>

            {/* Integration Management */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-cyan-600" />
                  Integration Management
                </CardTitle>
                <CardDescription>
                  Seamless connections to your existing tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Pre-built CRM integrations (HubSpot, Salesforce)</li>
                  <li>• Calendar and booking system connections</li>
                  <li>• Payment gateway integrations</li>
                  <li>• Custom API and webhook management</li>
                  <li>• Data sync monitoring and error handling</li>
                </ul>
              </CardContent>
            </Card>

            {/* Compliance & Security */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Monitor className="w-6 h-6 text-red-600" />
                  Compliance & Security
                </CardTitle>
                <CardDescription>
                  Enterprise-grade security and compliance tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• TCPA-compliant call handling and opt-outs</li>
                  <li>• HIPAA-aligned data handling (healthcare)</li>
                  <li>• Call recording consent management</li>
                  <li>• Data retention and privacy controls</li>
                  <li>• Audit trails and compliance reporting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Business Operations?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Get a personalized platform demo and see how the Invoxa.ai dashboard will revolutionize your voice AI operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-demo">
              <Button size="lg" className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700" data-testid="button-book-demo">
                Get a Platform Demo
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/studio">
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