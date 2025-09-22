import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Home, Monitor, BarChart, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Home
                </span>
              </Link>
              <Link href="/solutions">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Solutions</span>
              </Link>
              <Link href="/use-cases">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Use Cases</span>
              </Link>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Platform</span>
              <Link href="/why-invoxa">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Why Invoxa</span>
              </Link>
              <Link href="/resources">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Resources</span>
              </Link>
              <Link href="/book-demo">
                <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
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
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight"
            >
              Invoxa.ai Dashboard—
              <br />Real-Time Voice AI Control
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Monitor calls, analyze outcomes, and optimize agents in one unified command center.
            </motion.p>
          </motion.div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"
          />
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

      {/* Dashboard Preview Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              See Your Business Impact at a Glance
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get the insights that matter most to your business growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI Cards */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">94.2%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Call Success Rate</div>
                <div className="text-xs text-green-600 flex items-center justify-center">
                  <span className="mr-1">↗</span> +5.2% this month
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">$47K</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Cost Savings</div>
                <div className="text-xs text-green-600 flex items-center justify-center">
                  <span className="mr-1">↗</span> +12% vs. human agents
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">2,847</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Calls Handled</div>
                <div className="text-xs text-green-600 flex items-center justify-center">
                  <span className="mr-1">↗</span> 247 today
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">1.8s</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Avg Response Time</div>
                <div className="text-xs text-green-600 flex items-center justify-center">
                  <span className="mr-1">↗</span> 40% faster than target
                </div>
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