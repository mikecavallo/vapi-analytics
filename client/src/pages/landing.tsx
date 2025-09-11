import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Zap, Shield, ArrowRight, CheckCircle, Star, Globe, Headphones, Mic, Settings, PieChart, TrendingUp, Brain, Sparkles } from 'lucide-react';
import logoTransparent from "@assets/logo_transparent_1757373755849.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" data-testid="link-login">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="link-signup">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          🚀 Advanced Voice AI Analytics Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Unlock the Power of
          <span className="text-blue-600 block">Voice AI Analytics</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform your voice AI data into actionable insights. Monitor performance, optimize conversations, 
          and drive better outcomes with our comprehensive analytics dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-3" data-testid="button-get-started">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to optimize voice AI
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive analytics tools designed specifically for voice AI platforms and customer interactions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Real-time Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor call volume, success rates, and performance metrics in real-time with interactive dashboards
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Multi-tenant Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Secure, isolated analytics for multiple clients with role-based access control and data separation
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered insights to optimize conversation flows, reduce costs, and improve user satisfaction
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                SOC 2 compliant with end-to-end encryption, audit logs, and enterprise-grade security controls
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* VoiceScope Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <Badge variant="outline" className="mb-4 text-purple-600 border-purple-200">
              <Mic className="w-4 h-4 mr-2" />
              VoiceScope Analytics
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              See Every Voice Interaction
              <span className="text-purple-600 block">In Crystal Clear Detail</span>
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              VoiceScope provides deep visibility into your voice AI conversations with advanced transcription analysis, 
              sentiment tracking, and conversation flow mapping that reveals exactly what's working and what isn't.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Conversation Analysis</h4>
                  <p className="text-gray-600 dark:text-gray-300">Automatically identify conversation patterns, interruptions, and optimization opportunities</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-Time Performance Monitoring</h4>
                  <p className="text-gray-600 dark:text-gray-300">Track call success rates, duration patterns, and user satisfaction metrics live</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sentiment & Emotion Detection</h4>
                  <p className="text-gray-600 dark:text-gray-300">Understand caller emotions and satisfaction levels throughout the conversation</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-gray-900 dark:text-white">Live Conversation Monitor</h5>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Active Calls</span>
                  <span className="font-semibold text-green-600">247</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Avg Duration</span>
                  <span className="font-semibold text-blue-600">2m 34s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Success Rate</span>
                  <span className="font-semibold text-purple-600">94.2%</span>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <span className="text-xs text-gray-500">Latest Insight</span>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">📈 25% increase in positive sentiment detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assistant Studio Section */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-green-600" />
                </div>
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Assistant Builder</h5>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Healthcare Assistant</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">87% completion rate</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sales Support</span>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">In development</span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Create New Assistant
                </Button>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="mb-4 text-green-600 border-green-200">
                <Settings className="w-4 h-4 mr-2" />
                Assistant Studio
              </Badge>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Build Perfect Voice Assistants
                <span className="text-green-600 block">Without Code</span>
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Assistant Studio empowers you to create, customize, and optimize voice assistants with an intuitive 
                drag-and-drop interface. Deploy sophisticated conversational flows in minutes, not months.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Visual Flow Builder</h4>
                    <p className="text-gray-600 dark:text-gray-300">Design complex conversation paths with an intuitive visual interface</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Optimization</h4>
                    <p className="text-gray-600 dark:text-gray-300">Get intelligent suggestions to improve conversation flows and outcomes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Team Collaboration</h4>
                    <p className="text-gray-600 dark:text-gray-300">Work together with version control, comments, and approval workflows</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Dashboard Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
            <PieChart className="w-4 h-4 mr-2" />
            Custom Dashboard
          </Badge>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Your Data, Your Way
            <span className="text-blue-600 block">Personalized Insights Dashboard</span>
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            Create tailored dashboards that surface the metrics that matter most to your business. From executive summaries 
            to detailed operational views, get exactly the insights you need, when you need them.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Executive Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                High-level KPIs and trends designed for leadership teams and stakeholders
              </CardDescription>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• ROI & Cost Analysis</li>
                <li>• Performance Trends</li>
                <li>• Business Impact Metrics</li>
                <li>• Comparative Benchmarks</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Operational Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Detailed operational metrics for teams managing day-to-day voice AI operations
              </CardDescription>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• Real-time Call Monitoring</li>
                <li>• Assistant Performance</li>
                <li>• Error Detection & Alerts</li>
                <li>• Resource Utilization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Analytics Deep Dive</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Advanced analytics and custom reporting for data analysts and researchers
              </CardDescription>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• Custom Query Builder</li>
                <li>• Advanced Visualizations</li>
                <li>• Data Export & API Access</li>
                <li>• Historical Analysis</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Fully Customizable & White-Label Ready
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Brand the dashboard with your company's colors, logo, and styling. Configure widgets, 
                metrics, and layouts to match your specific workflow and reporting needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="px-6 py-3" data-testid="button-dashboard-demo">
                  <PieChart className="w-4 h-4 mr-2" />
                  View Dashboard Demo
                </Button>
                <Button variant="outline" className="px-6 py-3">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Your View
                </Button>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">2,847</div>
                  <div className="text-xs text-gray-500">Total Calls Today</div>
                  <div className="text-xs text-green-600 mt-1">↑ 12.5%</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">94.2%</div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                  <div className="text-xs text-green-600 mt-1">↑ 3.1%</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 mb-1">$1,247</div>
                  <div className="text-xs text-gray-500">Cost Savings</div>
                  <div className="text-xs text-green-600 mt-1">↑ 18.3%</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600 mb-1">4.8⭐</div>
                  <div className="text-xs text-gray-500">Satisfaction</div>
                  <div className="text-xs text-green-600 mt-1">↑ 0.3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-blue-100">Voice calls analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Platform uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Enterprise customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Expert support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Why leading companies choose Invoxa.ai
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Instant Setup</h4>
                  <p className="text-gray-600 dark:text-gray-300">Connect your Vapi API and start getting insights in minutes, not weeks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Actionable Insights</h4>
                  <p className="text-gray-600 dark:text-gray-300">AI-powered recommendations to improve conversation outcomes and reduce costs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Scalable Architecture</h4>
                  <p className="text-gray-600 dark:text-gray-300">Handle millions of voice interactions with enterprise-grade reliability</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Data Privacy</h4>
                  <p className="text-gray-600 dark:text-gray-300">Your data stays secure with advanced encryption and compliance certifications</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
            <div className="text-center">
              <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Trusted by industry leaders
              </h4>
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Invoxa.ai transformed how we analyze our voice AI performance. The insights helped us improve our success rate by 40%."
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-4">
                — Sarah Chen, CTO at TechCorp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to unlock your voice AI potential?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies using Invoxa.ai to optimize their voice AI performance and drive better business outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3" data-testid="button-cta-signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
              </div>
              <p className="text-gray-400">
                Advanced voice AI analytics platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Invoxa.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}