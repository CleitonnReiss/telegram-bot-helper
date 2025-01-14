import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, History } from "lucide-react";
import axios from "axios";

const Index = () => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem("telegram_bot_token");
    if (savedToken) {
      setBotToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (botToken) {
      localStorage.setItem("telegram_bot_token", botToken);
    }
  }, [botToken]);

  const validateBotToken = (token: string) => {
    return token.includes(":") && token.length > 20;
  };

  const sendMessage = async () => {
    if (!botToken || !message.trim() || !chatId) {
      toast({
        title: "Error",
        description: "Please provide bot token, chat ID, and message",
        variant: "destructive",
      });
      return;
    }

    if (!validateBotToken(botToken)) {
      toast({
        title: "Error",
        description: "Invalid bot token format. Please check your token.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify bot token is valid
      const botInfoResponse = await axios.get(
        `https://api.telegram.org/bot${botToken}/getMe`
      );

      if (!botInfoResponse.data.ok) {
        throw new Error("Invalid bot token");
      }

      // Send message to the specified chat
      const sendMessageResponse = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
        }
      );

      if (!sendMessageResponse.data.ok) {
        throw new Error("Failed to send message");
      }

      // Add to history
      setHistory((prev) => [message, ...prev].slice(0, 5));
      setMessage("");
      
      toast({
        title: "Success",
        description: "Message sent successfully!",
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      console.error("Telegram API Error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.description || "Failed to send message. Please check your bot token and chat ID.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 space-y-6 bg-white/80 backdrop-blur-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Telegram Bot Messenger
            </h1>
            <p className="text-sm text-gray-500">
              Send messages to a Telegram chat using your bot
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bot Token
              </label>
              <Input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Enter your bot token"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat ID
              </label>
              <Input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter the chat ID"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add your bot to a group and use the group's chat ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px]"
              />
            </div>

            <Button
              onClick={sendMessage}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </Card>

        {history.length > 0 && (
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Recent Messages</h2>
            </div>
            <div className="space-y-3">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700"
                >
                  {msg}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;