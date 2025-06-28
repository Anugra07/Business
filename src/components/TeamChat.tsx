import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface TeamChatProps {
  teamId: string;
}

export function TeamChat({ teamId }: TeamChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.getTeamMessages, { teamId: teamId as any });
  const sendMessage = useMutation(api.chat.sendMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        teamId: teamId as any,
        content: message.trim(),
      });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">💬</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h4>
            <p className="text-gray-600">Start the conversation with your team!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="flex space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {msg.sender?.firstName} {msg.sender?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-gray-800">{msg.content}</p>
                  {msg.fileUrl && (
                    <div className="mt-2">
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        📎 View attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
