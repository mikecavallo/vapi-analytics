import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "wouter";
import { ArrowRight, Home, Phone, MessageCircle, Zap, Settings, CheckCircle, ChevronDown, Target, BarChart3, Users, Brain, Mail, Calendar, CreditCard, Activity, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function SolutionsPage() {
  const [openDetails, setOpenDetails] = useState<string | null>(null);
  
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

      {/* Hero Section - SEO Optimized */}
      <section className="relative py-24 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                White-Glove Voice AI Solutions
                <br />for Every Team
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                From AI call agents to automated outreach—done-for-you setup, integration, and optimization.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/book-demo">
                <Button size="lg" className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-lg px-8 py-4">
                  Get Your Custom Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/use-cases">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  See Use Cases
                  <Target className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Voice AI Service Suite */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Voice AI Service Suite
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose your pathway to voice AI success. Each service includes complete setup, training, and ongoing optimization.
            </p>
          </motion.div>

          {/* How It Works - Process Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Discovery", desc: "We analyze your needs and design the perfect solution", icon: "🔍" },
                  { step: "2", title: "Setup", desc: "Complete implementation and integration with your systems", icon: "⚙️" },
                  { step: "3", title: "Go Live", desc: "Launch with full testing and quality assurance", icon: "🚀" },
                  { step: "4", title: "Optimize", desc: "Continuous monitoring and performance improvements", icon: "📈" }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Service Suite Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Tabs defaultValue="voice-agents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8">
                <TabsTrigger value="voice-agents" className="px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Voice Agents
                </TabsTrigger>
                <TabsTrigger value="messaging" className="px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messaging AI
                </TabsTrigger>
                <TabsTrigger value="automation" className="px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="consulting" className="px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Consulting
                </TabsTrigger>
              </TabsList>

              {/* Voice Agents Tab */}
              <TabsContent value="voice-agents" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <Phone className="w-8 h-8 text-blue-600" />
                        24/7 Voice AI Agents
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Intelligent call handling that never sleeps, always converts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {[
                          { title: "Inbound Call Handler", desc: "Answer & qualify every call, 24/7", icon: "📞" },
                          { title: "Outbound Campaigns", desc: "Automated calling with warm transfers", icon: "📱" },
                          { title: "Smart Scheduling", desc: "Books appointments in real-time", icon: "📅" }
                        ].map((feature, index) => (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70"
                          >
                            <div className="text-3xl mb-3">{feature.icon}</div>
                            <h4 className="font-bold mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                      
                      <Collapsible>
                        <CollapsibleTrigger
                          className="flex items-center justify-between w-full p-4 text-left bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          onClick={() => setOpenDetails(openDetails === 'voice' ? null : 'voice')}
                        >
                          <span className="font-medium">What's Included</span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${openDetails === 'voice' ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <ul className="space-y-2">
                              {[
                                "Custom AI training for your business",
                                "Natural conversation flow design", 
                                "CRM & calendar integrations",
                                "Call recording & transcription"
                              ].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                            <ul className="space-y-2">
                              {[
                                "Real-time analytics dashboard",
                                "24/7 monitoring & support",
                                "Performance optimization",
                                "Unlimited customizations"
                              ].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Other tabs content - simplified for brevity */}
              <TabsContent value="messaging" className="mt-8">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <MessageCircle className="w-8 h-8 text-purple-600" />
                      Messaging AI Automation
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Automated SMS, email, and direct mail campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { title: "SMS Campaigns", desc: "2-way texting & automated sequences", icon: "💬" },
                        { title: "Email Automation", desc: "Triggered campaigns based on behavior", icon: "📧" },
                        { title: "Direct Mail", desc: "Physical mailers from online events", icon: "📮" }
                      ].map((feature) => (
                        <div key={feature.title} className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70">
                          <div className="text-3xl mb-3">{feature.icon}</div>
                          <h4 className="font-bold mb-2">{feature.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="mt-8">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Zap className="w-8 h-8 text-green-600" />
                      Business Automations
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Connect your existing tools and automate workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { title: "CRM Integration", desc: "HubSpot, Salesforce, Zoho syncing", icon: "⚡" },
                        { title: "Calendar Booking", desc: "Google, Calendly, Acuity integration", icon: "📅" },
                        { title: "Payment Processing", desc: "Stripe, PayPal, QuickBooks", icon: "💳" }
                      ].map((feature) => (
                        <div key={feature.title} className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70">
                          <div className="text-3xl mb-3">{feature.icon}</div>
                          <h4 className="font-bold mb-2">{feature.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="consulting" className="mt-8">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Settings className="w-8 h-8 text-orange-600" />
                      AI Consulting & Strategy
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Custom strategy + our branded CRM built for lead nurturing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { title: "Strategy Development", desc: "Custom AI implementation roadmap", icon: "🎯" },
                        { title: "Performance Analysis", desc: "Deep insights & performance monitoring", icon: "📊" },
                        { title: "Ongoing Optimization", desc: "Continuous improvement & scaling", icon: "🚀" }
                      ].map((feature) => (
                        <div key={feature.title} className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70">
                          <div className="text-3xl mb-3">{feature.icon}</div>
                          <h4 className="font-bold mb-2">{feature.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Business?
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
                <Button size="lg" variant="outline" data-testid="button-view-cases">
                  View Use Cases
                  <Target className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}