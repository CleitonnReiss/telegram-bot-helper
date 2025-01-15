import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, History, Image as ImageIcon, Link, Plus, ArrowUp, ArrowDown, Moon, Sun, Minus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTheme } from "@/components/theme-provider";
import axios from "axios";

interface InlineButton {
  text: string;
  url: string;
  row?: number;
}

const Index = () => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [buttons, setButtons] = useState<InlineButton[]>([{ text: "", url: "", row: 0 }]);
  const [parseMode, setParseMode] = useState<"HTML" | "Markdown" | "">("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

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

  const addButton = () => {
    const lastButton = buttons[buttons.length - 1];
    const newRow = lastButton ? lastButton.row || 0 : 0;
    setButtons([...buttons, { text: "", url: "", row: newRow }]);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: keyof InlineButton, value: string | number) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setButtons(newButtons);
  };

  const moveButtonRow = (index: number, direction: "up" | "down") => {
    const newButtons = [...buttons];
    const currentRow = newButtons[index].row || 0;
    newButtons[index].row = direction === "up" ? currentRow - 1 : currentRow + 1;
    if (newButtons[index].row! < 0) newButtons[index].row = 0;
    setButtons(newButtons);
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
      const botInfoResponse = await axios.get(
        `https://api.telegram.org/bot${botToken}/getMe`
      );

      if (!botInfoResponse.data.ok) {
        throw new Error("Invalid bot token");
      }

      const buttonRows = buttons
        .filter(b => b.text && b.url)
        .reduce((acc: { text: string; url: string }[][], button) => {
          const row = button.row || 0;
          if (!acc[row]) acc[row] = [];
          acc[row].push({ text: button.text, url: button.url });
          return acc;
        }, [])
        .filter(row => row.length > 0);

      const replyMarkup = buttonRows.length > 0 ? {
        inline_keyboard: buttonRows
      } : undefined;

      if (imageUrl) {
        await axios.post(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            chat_id: chatId,
            photo: imageUrl,
            caption: message,
            parse_mode: parseMode || undefined,
            reply_markup: replyMarkup
          }
        );
      } else {
        await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            chat_id: chatId,
            text: message,
            parse_mode: parseMode || undefined,
            reply_markup: replyMarkup
          }
        );
      }

      setHistory((prev) => [message, ...prev].slice(0, 5));
      setMessage("");
      setImageUrl("");
      setButtons([{ text: "", url: "", row: 0 }]);
      
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
    <div className="min-h-screen bg-background transition-colors duration-300 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Telegram Bot Messenger
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        <Card className="p-6 space-y-6 bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="space-y-4">
            <div>
              <Label htmlFor="botToken" className="text-sm font-medium text-foreground">
                Bot Token
              </Label>
              <Input
                id="botToken"
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Enter your bot token"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
              </p>
            </div>

            <div>
              <Label htmlFor="chatId" className="text-sm font-medium text-foreground">
                Chat ID
              </Label>
              <Input
                id="chatId"
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter the chat ID"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add your bot to a group and use the group's chat ID
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Message Format</Label>
              <RadioGroup
                value={parseMode}
                onValueChange={(value) => setParseMode(value as "HTML" | "Markdown" | "")}
                className="flex space-x-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="none" />
                  <Label htmlFor="none">Plain Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HTML" id="html" />
                  <Label htmlFor="html">HTML</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Markdown" id="markdown" />
                  <Label htmlFor="markdown">Markdown</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-sm font-medium text-foreground">
                Image URL (Optional)
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="imageUrl"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="shrink-0"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" type="button" className="w-full">
                  <Link className="mr-2 h-4 w-4" />
                  Inline Buttons
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {buttons.map((button, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Button {index + 1} - Row {button.row! + 1}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => moveButtonRow(index, "up")}
                          title="Move to row above"
                          className="h-8 w-8"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => moveButtonRow(index, "down")}
                          title="Move to row below"
                          className="h-8 w-8"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={() => removeButton(index)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder="Button Text"
                        value={button.text}
                        onChange={(e) => updateButton(index, "text", e.target.value)}
                      />
                      <Input
                        placeholder="URL"
                        value={button.url}
                        onChange={(e) => updateButton(index, "url", e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  type="button"
                  onClick={addButton}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Button
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px] mt-1"
              />
              {parseMode === "HTML" && (
                <p className="text-xs text-muted-foreground mt-1">
                  You can use HTML tags: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;code&gt;monospace&lt;/code&gt;, &lt;a href="URL"&gt;link&lt;/a&gt;
                </p>
              )}
              {parseMode === "Markdown" && (
                <p className="text-xs text-muted-foreground mt-1">
                  You can use Markdown: **bold**, *italic*, `code`, [link](URL)
                </p>
              )}
            </div>

            <Button
              onClick={sendMessage}
              disabled={loading}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </Card>

        {history.length > 0 && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-medium text-foreground">Recent Messages</h2>
            </div>
            <div className="space-y-3">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg text-sm text-foreground"
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
