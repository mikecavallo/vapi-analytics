import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Zap, Shield, ArrowRight, CheckCircle, Star, Globe, Headphones, Mic, Settings, PieChart, TrendingUp, Brain, Sparkles, Phone, PhoneCall, Activity, MessageCircle, Cog, Database, Hand, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import logoTransparent from "@assets/logo_transparent_1757373755849.png";

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

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
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
  const animationFrameRef = useRef<number>(0);
  const MINIMUM_BEAMS = 15; // Reduced for better performance

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS;
      beamsRef.current = Array.from({ length: totalBeams }, () => 
        createBeam(canvas.width, canvas.height)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;

      beam.y = canvas.height + 100;
      beam.x = Math.random() * canvas.width;
      beam.width = 40 + Math.random() * 80;
      beam.speed = 0.8 + Math.random() * 0.6;
      beam.hue = 220 + Math.random() * 40; // Blue-purple theme
      beam.opacity = 0.15 + Math.random() * 0.20;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 70%, 60%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity * 0.3})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity * 0.3})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 70%, 60%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(20px)";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/solutions">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">Solutions</span>
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
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Book a Demo
                </Button>
              </Link>
            </div>
            <div className="md:hidden flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="link-login">Sign In</Button>
              </Link>
              <Link href="/book-demo">
                <Button size="sm" data-testid="link-signup">Book Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Animated Beams Background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none" 
          style={{ filter: "blur(15px)" }}
        />
        
        {/* Neon accent effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Additional subtle overlay for depth */}
        <motion.div
          className="absolute inset-0 bg-slate-900/10"
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          style={{
            backdropFilter: "blur(30px)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Side - Content */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text">
                    AI Agents That Work Like People,
                  </span>
                  <br />
                  <span className="text-white">Without the Payroll</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  We build, deploy, and manage AI voice agents, chatbots, and automations tailored to your business. Simple to use. Backed by our own platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-demo">
                  <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all" data-testid="button-book-demo">
                    Book a Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/solutions">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-gray-400 text-white hover:bg-white/10 hover:border-white transition-all" data-testid="button-explore-solutions">
                    Explore Solutions
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Split Visual */}
            <div className="relative h-[600px]">
              {/* Phone Call Interface - Left */}
              <div className="absolute left-0 top-0 w-[48%] h-full">
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-medium">Active Call</span>
                    </div>
                    <PhoneCall className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">IA</span>
                        </div>
                        <span className="text-blue-300 font-medium">Invoxa Agent</span>
                      </div>
                      <p className="text-gray-300 text-sm">"Hi! I'm calling about your recent inquiry. How can I help you today?"</p>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">Customer</span>
                      </div>
                      <p className="text-gray-300 text-sm">"Yes, I'd like to know more about your pricing options..."</p>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm font-medium">Call Duration</span>
                        <span className="text-green-300 font-mono">02:34</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard UI - Right */}
              <div className="absolute right-0 top-0 w-[48%] h-full">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-semibold flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-purple-400" />
                      VoiceScope Analytics
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs">Live</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200 text-sm">Active Calls</span>
                        <span className="text-blue-300 font-bold text-2xl">247</span>
                      </div>
                      <div className="w-full bg-blue-900/30 rounded-full h-2 mt-2">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full" style={{width: '73%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200 text-sm">Success Rate</span>
                        <span className="text-purple-300 font-bold text-2xl">94.2%</span>
                      </div>
                      <div className="text-green-400 text-xs mt-1">↑ 12.3% from last week</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200 text-sm">Avg Duration</span>
                        <span className="text-emerald-300 font-bold text-2xl">2m 34s</span>
                      </div>
                      <div className="text-green-400 text-xs mt-1">Optimal range</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-200 text-xs font-medium">AI Insight:</span>
                      </div>
                      <p className="text-yellow-100 text-xs mt-1">25% increase in positive sentiment detected</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connection line between the two panels */}
              <div className="absolute top-1/2 left-[48%] w-[4%] h-px bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-y-1/2">
                <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              AI Solutions That Grow With Your Business
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We don't sell tools. We deliver outcomes. Whether you need an agent that books appointments, 
              a chatbot that never sleeps, or a CRM that nurtures every lead—we design the solution and make it work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Voice Agents */}
            <Link href="/solutions/voice-agents">
              <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Voice Agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    Answer calls, qualify leads, and schedule—without human overhead.
                  </CardDescription>
                  <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Chatbots & Digital Agents */}
            <Link href="/solutions/chatbots">
              <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Chatbots & Digital Agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    24/7 chat that understands your customers.
                  </CardDescription>
                  <div className="mt-4 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* AI Business Automations */}
            <Link href="/solutions/automations">
              <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Cog className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Business Automations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    Cut manual work, scale faster.
                  </CardDescription>
                  <div className="mt-4 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* AI Consulting & CRM */}
            <Link href="/solutions/consulting-crm">
              <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Consulting & CRM
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    Custom strategy + our branded CRM built for lead nurturing.
                  </CardDescription>
                  <div className="mt-4 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              The tech under the hood
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powered by Our Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-16">
              Our flagship solutions are delivered through our own platform—built to give you clarity, control, and results.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* VoiceScope Analytics */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
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
                {/* Analytics Mockup */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Call Analysis Dashboard</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-lg font-bold text-purple-600">94.2%</div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">2.4m</div>
                        <div className="text-xs text-gray-500">Avg Duration</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">AI Insight</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        "Positive sentiment increased 25% this week"
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assistant Studio */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
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
                {/* Studio Mockup */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Assistant Builder</div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Healthcare Assistant</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Active</Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                      <span className="text-xs text-gray-500">87% completion rate</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sales Support</span>
                        <Badge variant="outline" className="text-xs">Draft</Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '42%'}}></div>
                      </div>
                      <span className="text-xs text-gray-500">In development</span>
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
                    <BarChart3 className="w-6 h-6 text-white" />
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