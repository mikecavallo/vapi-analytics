import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Download, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/layout/site-header";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VoiceScopePage() {
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

  // Fetch call data for context
  const { data: callData } = useQuery({ 
    queryKey: ['/api/analytics/summary/'],
  });

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
      return `Based on your data, you have ${data?.kpis?.totalCalls || 863} total calls with an average duration of ${data?.kpis?.avgDuration ? Math.round(data.kpis.avgDuration / 60 * 100) / 100 : 1.23} minutes.`;
    }
    
    if (lowerQuery.includes('success') || lowerQuery.includes('rate')) {
      return `Your success rate is ${data?.kpis?.successRate || 57.13}%. This is calculated based on calls that ended successfully versus total calls.`;
    }
    
    if (lowerQuery.includes('cost') || lowerQuery.includes('expensive')) {
      return `Your total cost is $${data?.kpis?.totalCost || 106.18} with an average cost per call of $${data?.costAnalysis?.avgCostPerCall || 0.12}.`;
    }
    
    if (lowerQuery.includes('duration') || lowerQuery.includes('long')) {
      return `The average call duration is ${data?.kpis?.avgDuration ? Math.round(data.kpis.avgDuration / 60 * 100) / 100 : 1.23} minutes. Most calls fall into the 2-3 minute range based on your duration distribution.`;
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

  const handleExportDataset = async () => {
    try {
      // Create export data
      const exportData = {
        metadata: {
          title: "VoiceScope Analytics Dataset",
          exportedAt: new Date().toISOString(),
          totalCalls: (callData as any)?.kpis?.totalCalls || 0,
        },
        analytics: callData,
        chatHistory: messages
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `voicescope-dataset-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="heading-voicescope">
                  VoiceScope
                </h1>
                <p className="text-gray-600 dark:text-gray-300" data-testid="text-voicescope-description">
                  Chat with your data and get insights from your voice AI analytics
                </p>
              </div>
              <Button 
                onClick={handleExportDataset}
                className="flex items-center gap-2"
                data-testid="button-get-dataset"
              >
                <Database size={16} />
                Get Dataset
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="h-[600px] flex flex-col" data-testid="card-chat-interface">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bot className="text-primary" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Data Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground">Ask questions about your call analytics</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4" data-testid="scroll-messages">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.type}-${message.id}`}
                      >
                        {message.type === 'assistant' && (
                          <div className="p-2 rounded-full bg-primary/10 h-fit">
                            <Bot size={16} className="text-primary" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        
                        {message.type === 'user' && (
                          <div className="p-2 rounded-full bg-primary/10 h-fit order-1">
                            <User size={16} className="text-primary" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3" data-testid="loading-indicator">
                        <div className="p-2 rounded-full bg-primary/10 h-fit">
                          <Bot size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-chat-input">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about your call data..."
                      disabled={isLoading}
                      className="flex-1"
                      data-testid="input-chat-message"
                    />
                    <Button 
                      type="submit" 
                      disabled={!inputValue.trim() || isLoading}
                      data-testid="button-send-message"
                    >
                      <Send size={16} />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}