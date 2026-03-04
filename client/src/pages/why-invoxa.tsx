import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Star, Users, Quote, TrendingUp, Shield, Clock, Hand, Phone, MessageCircle, Building2, Heart, DollarSign, HomeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from '@/components/layout/public-navbar';

export default function WhyInvoxaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
              Proven Results with
              <br />White-Glove Voice AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-cyan-100 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Client stories, measurable ROI, and a partnership that scales with your business.
            </motion.p>
          </motion.div>
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