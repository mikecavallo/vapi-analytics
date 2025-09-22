import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Home, CheckCircle, Star, Users, Quote, TrendingUp, Shield, Clock, Hand, Phone, MessageCircle, Building2, Heart, DollarSign, HomeIcon } from "lucide-react";

export default function WhyInvoxaPage() {
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
              <Link href="/platform">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Platform</span>
              </Link>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Why Invoxa</span>
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
              Proven Results with
              <br />White-Glove Voice AI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Client stories, measurable ROI, and a partnership that scales with your business.
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
              duration: 22, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 28, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Why White-Glove Service Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              The White-Glove Difference
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              While others sell tools, we deliver working solutions with full-service support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-green-600" />
                  Setup in Hours, Not Weeks
                </CardTitle>
                <CardDescription>
                  Complete implementation with our expert team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Discovery call to understand your needs</li>
                  <li>• Custom AI agent training and setup</li>
                  <li>• Integration with your existing systems</li>
                  <li>• Testing and quality assurance</li>
                  <li>• Go-live support and monitoring</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Hand className="w-6 h-6 text-blue-600" />
                  Hands-On Support
                </CardTitle>
                <CardDescription>
                  Dedicated team managing your success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Dedicated success manager assigned</li>
                  <li>• Continuous monitoring and optimization</li>
                  <li>• Regular performance reviews and updates</li>
                  <li>• Unlimited support and adjustments</li>
                  <li>• Strategic guidance for scaling</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Proven Results
                </CardTitle>
                <CardDescription>
                  Measurable business impact from day one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• 95%+ call success rates achieved</li>
                  <li>• 40%+ improvement in lead capture</li>
                  <li>• 60% reduction in missed opportunities</li>
                  <li>• 24/7 availability without human costs</li>
                  <li>• Immediate ROI and cost savings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Success Stories */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Real Client Success Stories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how businesses across industries achieved transformational results
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Law Firm Case Study */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Law Firm</Badge>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl">Streamlined Discovery Calls for Busy Attorney</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <Quote className="w-5 h-5 text-gray-400 mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "I was overwhelmed with discovery calls. Now our AI agent gathers facts, summarizes situations, and routes urgent criminal cases for instant callback while handling minor questions automatically."
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Hours</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Saved Daily</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">Zero</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">High-Value Cases Missed</div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Result: Complete CRM integration with searchable transcripts, never misses high-value cases
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* E-Commerce Case Study */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">E-Commerce</Badge>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl">Superior Customer Service for Online Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <Quote className="w-5 h-5 text-gray-400 mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "We needed better customer service. The AI chat and SMS agents handle order tracking, payment integration gives instant refund status, and sentiment analysis flags upset customers for human callbacks."
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Faster</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Service Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">More</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Repeat Buyers</div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Result: Faster service, fewer angry emails, increased customer retention
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Results Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Insurance Result */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Insurance Agency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Reduced policy lapses with automated payment reminders and birthday/holiday relationship building
                </p>
              </CardContent>
            </Card>

            {/* Healthcare Result */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Medical Practice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Reduced no-shows with automated reminders and rescheduling links
                </p>
              </CardContent>
            </Card>

            {/* Real Estate Result */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <HomeIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Real Estate Brokerage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Increased lead response time from hours to minutes with instant qualification
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready for Your Success Story?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join the businesses already transforming their operations with white-glove voice AI implementation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-demo">
              <Button size="lg" className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700" data-testid="button-book-demo">
                Get Your White-Glove Setup
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/use-cases">
              <Button size="lg" variant="outline" data-testid="button-view-stories">
                View More Success Stories
                <Users className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}