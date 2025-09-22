import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Home, Phone, MessageCircle, Users, Zap, Shield, Building2, Settings, Database, BarChart3, Bell, CheckCircle, Mic, Mail, Calendar, CreditCard, Bot, Activity, Brain, Target, Headphones, Globe } from "lucide-react";

export default function SolutionsPage() {
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
              <span className="text-blue-600 dark:text-blue-400 font-medium">Solutions</span>
              <Link href="/use-cases">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Use Cases</span>
              </Link>
              <Link href="/platform">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Platform</span>
              </Link>
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              White-Glove Voice AI Solutions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Complete voice AI implementation and automation services. From setup to optimization, we handle everything so you can focus on what matters most – growing your business.
            </p>
          </div>
        </div>
      </section>

      {/* Core Service Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Voice AI Service Menu
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              End-to-end implementation with white-glove service and ongoing support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Voice AI Agents */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                  Voice AI Agents
                </CardTitle>
                <CardDescription>
                  Intelligent call handling with natural conversation flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Inbound AI Fronter</strong> – Answer & qualify calls 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Outbound AI Fronter</strong> – Automated calling campaigns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Warm Transfer Setup</strong> – Route qualified leads instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Voicemail Drops</strong> – Personalized messages at scale
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Call Recording & QA</strong> – Auto transcribe & analyze
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
                  Automated SMS, email, and direct mail campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>SMS Automations</strong> – 2-way texting & reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Email Automations</strong> – Triggered replies & follow-ups
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Direct Mail Triggers</strong> – Physical mailers from events
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Drip Campaigns</strong> – Nurture sequences
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Abandoned Cart Recovery</strong> – E-commerce automation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Integrations & Automations */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-green-600" />
                  Integrations & Automations
                </CardTitle>
                <CardDescription>
                  Connect your existing tools and automate workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>CRM Integration</strong> – HubSpot, Salesforce, Zoho
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Dialer Integration</strong> – Five9, RingCentral, Aircall
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Calendar & Booking</strong> – Google, Calendly, Acuity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Payment Systems</strong> – Stripe, PayPal, QuickBooks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Database Sync</strong> – Airtable, Google Sheets, SQL
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Customer Experience Automation */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-600" />
                  Customer Experience
                </CardTitle>
                <CardDescription>
                  Automate onboarding, support, and feedback workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Onboarding Sequences</strong> – Welcome automation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Customer Support AI</strong> – Chatbots & Tier 1 issues
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Surveys & Feedback</strong> – NPS & satisfaction tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Ticketing Automation</strong> – Zendesk, Freshdesk workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Warranty Claims</strong> – Automated processing
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Custom AI Builds */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-indigo-600" />
                  Custom AI Builds
                </CardTitle>
                <CardDescription>
                  Tailored AI solutions for unique business requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>API-to-API Bridges</strong> – Connect any platforms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Data Enrichment</strong> – Auto-cleaning pipelines
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Workflow Orchestration</strong> – Multi-step sequences
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>AI Training</strong> – Company-specific fine-tuning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Prompt Engineering</strong> – Optimized AI instructions
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics & Intelligence */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-cyan-600" />
                  Analytics & Intelligence
                </CardTitle>
                <CardDescription>
                  Deep insights and performance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Transcription & Summarization</strong> – All conversations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Sentiment Analysis</strong> – Detect emotions & urgency
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Performance Dashboards</strong> – Real-time metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Automated Alerts</strong> – Flag VIPs & escalations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Security & Compliance</strong> – TCPA, HIPAA aligned
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Our White-Glove Service Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From discovery to deployment, we handle everything
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">1. Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We analyze your current processes and identify automation opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">2. Build & Configure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Custom AI agent training, integration setup, and workflow automation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">3. Deploy & Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Launch with comprehensive testing and quality assurance processes
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">4. Ongoing Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Continuous monitoring, optimization, and unlimited support included
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Transparent Pricing Structure
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Flexible plans designed for businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Badge className="w-fit mb-2">One-Time</Badge>
                <CardTitle>Setup Fee</CardTitle>
                <CardDescription>
                  Discovery, integration build, agent training, and launch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Covers initial implementation to get your working foundation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Badge className="w-fit mb-2">Monthly</Badge>
                <CardTitle>Platform Access</CardTitle>
                <CardDescription>
                  Platform access, monitoring, unlimited support, free usage minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Includes maintenance, bug fixes, optimization, and dev hours for tweaks
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Badge className="w-fit mb-2">Usage-Based</Badge>
                <CardTitle>AI Call Minutes</CardTitle>
                <CardDescription>
                  Per-minute charges after free tier with volume discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Transparent billing with itemized costs visible in your dashboard
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready for White-Glove Voice AI Implementation?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Get a custom implementation plan with full-service setup, training, and ongoing support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-demo">
              <Button size="lg" className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700" data-testid="button-book-demo">
                Schedule Discovery Call
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/use-cases">
              <Button size="lg" variant="outline" data-testid="button-view-use-cases">
                View Use Cases
                <Globe className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}