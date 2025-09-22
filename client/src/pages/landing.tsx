import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Zap, Shield, ArrowRight, CheckCircle, Star, Globe, Headphones, Mic, Settings, PieChart, TrendingUp, Brain, Sparkles, Phone, PhoneCall, Activity, MessageCircle, Cog, Database, Hand, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import logoTransparent from "@assets/logo_transparent_1757609077252.png";
import { PlasmaBackground } from '@/components/PlasmaBackground';
import { SplitText } from '@/components/SplitText';
import { ShinyText } from '@/components/ShinyText';

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(canvas: HTMLCanvasElement): Beam {
  const width = canvas.width;
  const height = canvas.height;
  
  // Create beams from bottom going upward at slight angles
  const angle = -90 + (Math.random() - 0.5) * 30; // -105 to -75 degrees
  
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: angle,
    speed: 1.0 + Math.random() * 1.5,
    opacity: 0.15 + Math.random() * 0.20, // Increased visibility
    hue: 220 + Math.random() * 40, // Blue-purple range for your theme
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize beams
    beamsRef.current = Array.from({ length: 12 }, () => createBeam(canvas));

    const resetBeam = (beam: Beam): Beam => {
      beam.y = canvas.height + 100;
      beam.x = Math.random() * canvas.width;
      beam.width = 40 + Math.random() * 80;
      beam.speed = 0.8 + Math.random() * 0.6;
      beam.hue = 220 + Math.random() * 40; // Blue-purple theme
      beam.opacity = 0.15 + Math.random() * 0.20;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      const currentOpacity = beam.opacity + Math.sin(beam.pulse) * 0.1;
      
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 70%, 60%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 70%, 60%, ${currentOpacity * 0.8})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 70%, 60%, ${currentOpacity})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 70%, 60%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      beamsRef.current = beamsRef.current.map(beam => {
        // Update beam position
        const radians = (beam.angle * Math.PI) / 180;
        beam.x += Math.cos(radians + Math.PI / 2) * beam.speed;
        beam.y += Math.sin(radians + Math.PI / 2) * beam.speed;
        
        // Update pulse
        beam.pulse += beam.pulseSpeed;
        
        // Reset beam if it goes off screen
        if (beam.y < -beam.length || beam.x < -beam.width || beam.x > canvas.width + beam.width) {
          return resetBeam(beam);
        }
        
        drawBeam(ctx, beam);
        return beam;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-8" />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
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
              <Link href="/resources">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Resources</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/book-demo">
                <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white px-6 shadow-lg shadow-cyan-500/25">
                  Book Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white min-h-[90vh] flex items-center">
        {/* Plasma Background */}
        <PlasmaBackground className="opacity-40" />
        {/* Animated Background Beams */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-20"
          style={{ mixBlendMode: 'lighten' }}
        />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side - Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-cyan-500/20 rounded-full px-4 py-2 border border-cyan-300/30">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="text-sm text-cyan-100">Transform Your Customer Experience</span>
              </div>
              
              <div className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <div className="block">
                  <SplitText 
                    text="AI Agents That" 
                    className="inline"
                    animationType="fadeInUp"
                    delay={0.5}
                    stagger={0.05}
                  />
                </div>
                <div className="block">
                  <SplitText 
                    text="Work Like People" 
                    className="inline"
                    animationType="fadeInUp"
                    delay={0.8}
                    stagger={0.05}
                  />
                </div>
                <div className="block whitespace-nowrap">
                  <SplitText 
                    text="Without the Payroll"
                    className="inline text-cyan-300 font-bold"
                    animationType="fadeInUp"
                    delay={1.2}
                    stagger={0.08}
                  />
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-cyan-100 max-w-2xl">
                <ShinyText 
                  text="Deploy intelligent voice assistants that handle your calls, capture every lead, and scale your business—all while you sleep."
                  shimmerDuration={3}
                  shimmerDelay={2}
                  shimmerColor="rgba(191, 219, 254, 0.8)"
                />
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-demo">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Book Your Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/solutions">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-4 rounded-xl font-semibold bg-transparent transition-all duration-300">
                  Explore Solutions
                  <Globe className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-blue-200 text-sm">Call Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-blue-200 text-sm">Always Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">&lt; 2 hrs</div>
                <div className="text-blue-200 text-sm">Setup Time</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Visual Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Phone Interface Mockup */}
            <div className="relative mx-auto max-w-sm">
              <div className="bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-gray-100 rounded-[2.5rem] p-4">
                  <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-8 text-white text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">AI Assistant Active</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span className="text-sm">Handling incoming call</span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Conversation Flow</div>
                          <div className="text-xs text-gray-500">Natural language processing</div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Brain className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Intent Recognition</div>
                          <div className="text-xs text-gray-500">Understanding customer needs</div>
                        </div>
                        <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Database className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Data Capture</div>
                          <div className="text-xs text-gray-500">Lead information secured</div>
                        </div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Dashboard Preview */}
              <div className="absolute -right-8 top-20 bg-white rounded-xl shadow-xl p-4 max-w-xs hidden lg:block">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Live Dashboard</h4>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">94.2%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-600">$2,847</div>
                    <div className="text-xs text-gray-500">Saved Today</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              White-Glove Voice AI Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete implementation from discovery to deployment. We don't just provide tools—we deliver working AI agents that transform your business operations with full-service support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Voice AI Agents */}
            <Link href="/solutions">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Voice AI Agents
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    24/7 inbound & outbound call handling with warm transfers and lead qualification.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Messaging AI */}
            <Link href="/solutions">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Messaging AI
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Automated SMS, email, and direct mail campaigns with 2-way conversations.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* CRM & Integrations */}
            <Link href="/solutions">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    CRM & Integrations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Seamless workflow automation across all your existing platforms.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Analytics & Intelligence */}
            <Link href="/solutions">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Analytics & Intelligence
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Real-time performance monitoring with automated insights and alerts.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powered by Our Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Our flagship solutions are delivered through our own platform—built to give you clarity, control, and results.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              The tech under the hood.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* VoiceScope Analytics */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    VoiceScope Analytics
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                  Analyze calls, spot trends, and ask questions in plain English.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* VoiceScope Mockup */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Analytics Dashboard</div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Call Trends</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Live</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
                          <div className="text-lg font-bold text-blue-600">2,847</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total Calls</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                          <div className="text-lg font-bold text-green-600">94.2%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-center text-gray-500">
                      Ask: "Show me today's performance trends"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assistant Studio */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Assistant Studio
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                  Design AI agents without code—just describe what you need.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Assistant Studio Mockup */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Agent Builder</div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Agent</span>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Active</Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
                          "Create an agent that books appointments for my dental practice"
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <div className="text-xs text-gray-500">Building agent... 87% complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                  One place to manage every agent, conversation, and workflow.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Dashboard Mockup */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Control Center</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <div className="text-sm font-bold text-green-600">12</div>
                        <div className="text-xs text-gray-500">Active Agents</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <div className="text-sm font-bold text-blue-600">247</div>
                        <div className="text-xs text-gray-500">Live Calls</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent Activity</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">• Agent deployed successfully</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">• 5 new conversations started</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">• Performance report ready</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Invoxa Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
              The White-Glove AI Partner
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Comparison Visual */}
            <div className="relative">
              {/* Generic SaaS Interface (Grayed Out) */}
              <div className="relative mb-8 lg:mb-0">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-600 opacity-60">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded p-3">
                      <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded p-3">
                      <div className="w-20 h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Generic SaaS Tool</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">"Figure it out yourself"</div>
                  </div>
                </div>
              </div>

              {/* VS Divider with White Glove Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-xl border-4 border-blue-500">
                  <Hand className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Invoxa Dashboard (Polished) */}
              <div className="absolute top-0 right-0 lg:relative lg:top-auto lg:right-auto">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-300 dark:border-blue-600 shadow-xl">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Invoxa Dashboard</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
                        <div className="text-lg font-bold text-blue-600">94.2%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                        <div className="text-lg font-bold text-green-600">247</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Active Calls</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800 dark:text-blue-300">White-Glove Support Active</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      "Your dedicated team is monitoring performance"
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Invoxa Platform</div>
                    <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">"We handle everything"</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Agents live in hours, not weeks.
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    While others give you tools to build with, we deliver working AI agents ready to serve your customers immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    We handle deployment, training, and monitoring.
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    No more wrestling with configurations or wondering if your AI is performing well. Our team manages everything behind the scenes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hand className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Hands-on support and strategy, not "DIY docs."
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get real human experts who understand your business goals and optimize your AI agents for maximum impact.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                    Experience White-Glove Service
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof & Trust Section */}
      <section className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Trusted by Teams Ready to Scale
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From startups to established businesses, we deliver results that matter: more leads answered, more customers converted, less time wasted.
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial Card 1 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-1 mb-4">
                  <Quote className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "Our call response rate increased by 40% in the first month. The white-glove setup meant we were live in hours, not weeks."
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">Sarah Chen</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">VP of Operations, TechStart Inc.</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Card 2 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-1 mb-4">
                  <Quote className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "Finally, AI that works like we promised our customers. The support team feels like an extension of our company."
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">Marcus Rodriguez</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CEO, GrowthCorp</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Card 3 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-start space-x-1 mb-4">
                  <Quote className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "We went from missing 60% of leads to capturing 95%. The ROI was immediate and measurable."
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">Jennifer Kim</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Director of Sales, ScaleUp Solutions</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logo Bar Placeholder */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-wider font-medium">
              Trusted by Leading Companies
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
              {/* Logo Placeholder 1 */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-32 h-12 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client Logo</span>
              </div>
              
              {/* Logo Placeholder 2 */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-32 h-12 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client Logo</span>
              </div>
              
              {/* Logo Placeholder 3 */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-32 h-12 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client Logo</span>
              </div>
              
              {/* Logo Placeholder 4 */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-32 h-12 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client Logo</span>
              </div>
              
              {/* Logo Placeholder 5 */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-32 h-12 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client Logo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-700 to-blue-900 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Ready to Launch Smarter Conversations?
            </h2>
            <p className="text-xl md:text-2xl text-violet-100 mb-12 max-w-2xl mx-auto">
              Join the businesses already scaling with AI agents that work like people, without the payroll.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Primary CTA - Book a Demo */}
              <Link href="/book-demo">
                <Button 
                  size="lg" 
                  className="bg-white text-violet-700 hover:bg-gray-100 hover:text-violet-800 text-xl px-12 py-6 rounded-xl font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 border-0 glow-button"
                  data-testid="button-book-demo-final"
                >
                  Book a Demo
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              
              {/* Secondary CTA - Talk to Expert */}
              <Link href="/book-demo">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-violet-700 text-xl px-12 py-6 rounded-xl font-bold bg-transparent transition-all duration-300 transform hover:scale-105"
                  data-testid="button-talk-expert"
                >
                  Talk to an Expert
                  <MessageCircle className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-violet-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No long-term contracts</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Setup in hours, not weeks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>White-glove support included</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}