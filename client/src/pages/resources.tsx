import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Home, FileText, Video, BookOpen } from "lucide-react";

export default function ResourcesPage() {
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
              <Link href="/why-invoxa">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Why Invoxa</span>
              </Link>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Resources</span>
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
              Voice AI Resources
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Everything you need to master voice AI analytics and optimization. Guides, tutorials, best practices, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Section - Placeholder */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Complete guides and API documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Ready for your custom documentation links and resources.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-purple-600" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Step-by-step video guides and webinars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Ready for your custom video content and tutorials.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  Best Practices
                </CardTitle>
                <CardDescription>
                  Industry best practices and case studies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Ready for your custom best practice guides and case studies.
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
            Need More Help?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Our team is here to help you succeed with voice AI analytics
          </p>
          <Link href="/book-demo">
            <Button size="lg" className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700" data-testid="button-book-demo">
              Get Expert Help
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}