// Chat.tsx
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { useParameters } from "@/contexts/ParametersContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Chat = () => {
  const {
    experienceLevel,
    learningStyle,
    parameterChanged,
    acknowledgeParameterChange
  } = useParameters();

  // This will hold the system message about parameter changes
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: "/api/openai",
    body: {
      experienceLevel,
      learningStyle,
      parameterChanged
    },
    onFinish: () => {
      // After the chat completion finishes, acknowledge the parameter change
      if (parameterChanged) {
        acknowledgeParameterChange();
      }
    }
  });

  const clearChat = () => {
    setMessages([]);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scroll = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Update system message when parameters change
  useEffect(() => {
    if (parameterChanged) {
      console.log("Parameters updated:", { experienceLevel, learningStyle });
      setSystemMessage(`Parameter changes will be acknowledged in the next response.`);
    } else {
      setSystemMessage(null);
    }
  }, [parameterChanged, experienceLevel, learningStyle]);

  useEffect(() => {
    scroll();
  }, [messages]);

  // Create a custom submit handler that wraps the original
  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <Card className="flex flex-col h-[70vh] md:h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-avatar.png" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">AI Mentor</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      {/* Chat message area with scroll */}
      <ScrollArea className="flex-grow p-4">
        {systemMessage && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs text-blue-700">
              {systemMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {messages.map((m, index) => (
            <div key={m.id}>
              <div className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role !== "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
                
                {m.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user-avatar.jpg" alt="User" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              {index < messages.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="p-4 border-t">
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            name="input-field"
            placeholder="Ask about investing..."
            onChange={handleInputChange}
            value={input}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default Chat;