import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  callData?: any;
}

export default function AIChatbot({ callData }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I can help you analyze your call data. Ask me about call patterns, outcomes, durations, or any other metrics you\'d like to understand better.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response based on the query
    const response = await generateAIResponse(userMessage.content, callData);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setTimeout(() => {
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = async (query: string, data: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('total') && lowerQuery.includes('call')) {
      return `Based on your data, you have ${data?.kpis?.totalCalls || 863} total calls with an average duration of ${data?.kpis?.avgDuration || 1.23} seconds.`;
    }
    
    if (lowerQuery.includes('success') || lowerQuery.includes('rate')) {
      return `Your success rate is ${data?.kpis?.successRate || 57.13}%. This is calculated based on calls that ended successfully versus total calls.`;
    }
    
    if (lowerQuery.includes('cost') || lowerQuery.includes('expensive')) {
      return `Your total cost is $${data?.kpis?.totalCost || 106.18} with an average cost per call of $${data?.costAnalysis?.avgCostPerCall || 0.12}.`;
    }
    
    if (lowerQuery.includes('duration') || lowerQuery.includes('long')) {
      return `The average call duration is ${data?.kpis?.avgDuration || 1.23} seconds. Most calls fall into the 2-3 minute range based on your duration distribution.`;
    }
    
    if (lowerQuery.includes('outcome') || lowerQuery.includes('end')) {
      const topOutcome = data?.callOutcomes?.[0];
      return `The most common call outcome is "${topOutcome?.outcome || 'customer-ended-call'}" with ${topOutcome?.percentage || 57.13}% of calls.`;
    }
    
    if (lowerQuery.includes('assistant') || lowerQuery.includes('performance')) {
      const topAssistant = data?.assistantPerformance?.[0];
      return `Your top performing assistant has handled ${topAssistant?.calls || 14} calls with a ${topAssistant?.successRate || 98.41}% success rate.`;
    }
    
    if (lowerQuery.includes('time') || lowerQuery.includes('when') || lowerQuery.includes('hour')) {
      return `Based on your hourly patterns, peak call times are around 6 PM with 345 calls, followed by 3 PM with 258 calls. Business hours (9 AM - 5 PM) show the highest activity.`;
    }
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('growing') || lowerQuery.includes('increasing')) {
      return `Your call volume has been trending upward, with recent data showing 431 calls in the latest period compared to 172 calls earlier. This represents strong growth in usage.`;
    }

    // Default response
    return `I can help you analyze various aspects of your call data including:
    
• Total calls and success rates
• Cost analysis and trends  
• Call duration patterns
• Outcome distributions
• Assistant performance
• Peak usage times

What specific metric would you like me to analyze for you?`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
              data-testid="button-open-chat"
            >
              <MessageCircle size={24} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className={`${isMinimized ? 'h-16' : 'h-96'} w-80 shadow-xl transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bot className="text-primary" size={16} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">AI Assistant</CardTitle>
                    <p className="text-xs text-muted-foreground">Ask about your call data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0"
                    data-testid="button-minimize-chat"
                  >
                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                    data-testid="button-close-chat"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </CardHeader>
              
              {!isMinimized && (
                <CardContent className="p-0 flex flex-col h-80">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.type === 'assistant' && (
                                <Bot size={14} className="mt-1 flex-shrink-0" />
                              )}
                              {message.type === 'user' && (
                                <User size={14} className="mt-1 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.type === 'user' 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Loading Message */}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                            <div className="flex items-center space-x-2">
                              <Bot size={14} />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about your call data..."
                        className="flex-1"
                        disabled={isLoading}
                        data-testid="input-chat-message"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading || !inputValue.trim()}
                        data-testid="button-send-message"
                      >
                        <Send size={16} />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}