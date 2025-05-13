"use client";

import { useState, useEffect, useRef } from "react";
import { useAgent } from "./hooks/useAgent";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import AgentSelector from "./components/AgentSelector";

/**
 * Home page for the AgentKit Quickstart
 *
 * @returns {React.ReactNode} The home page
 */
export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isThinking, activeAgent, switchAgent } =
    useAgent();

  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center text-black dark:text-white w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Standalone top bar for AgentKit brand */}
      <div className="w-full bg-white/80 dark:bg-gray-900/80 shadow-sm py-4 px-8 flex items-center justify-start fixed top-0 left-0 z-20">
        <h1 className="text-2xl font-bold text-[#0052FF] tracking-tight">
          AgentKit
        </h1>
      </div>
      {/* Spacer for fixed top bar */}
      <div className="h-16" />
      {/* Main header with agent selector and create button */}
      <div className="flex w-full max-w-4xl justify-between mb-10 mt-4 items-center px-8 py-4 rounded-xl bg-white/70 dark:bg-gray-900/70 shadow-md">
        <div className="flex items-center space-x-8">
          <AgentSelector
            activeAgent={activeAgent}
            onAgentChange={switchAgent}
          />
        </div>
        <Link href="/create">
          <button className="px-6 py-2.5 rounded-lg font-medium bg-[#0052FF] hover:bg-[#003ECF] text-white shadow-lg flex items-center transition-all duration-200">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Agent
          </button>
        </Link>
      </div>

      <div className="w-full max-w-4xl h-[75vh] bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 flex flex-col border border-gray-100 dark:border-gray-700 mt-4">
        <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Chatting with{" "}
                <span className="text-[#0052FF]">{activeAgent}</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Using model:{" "}
                {activeAgent === "default"
                  ? "OpenAI (GPT-4o-mini)"
                  : "Custom model"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-[#0052FF] dark:text-blue-300">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 p-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#0052FF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Begin chatting with your AI agent to explore its capabilities
                and get things done.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl shadow-sm max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-[#0052FF] text-white self-end ml-12"
                    : "bg-gray-50 dark:bg-gray-700/50 self-start mr-12 border border-gray-100 dark:border-gray-600"
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: (props) => (
                      <a
                        {...props}
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))
          )}

          {isThinking && (
            <div className="flex items-center justify-end space-x-2 text-gray-500 dark:text-gray-400">
              <span className="text-sm">Processing</span>
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 rounded-full bg-[#0052FF] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#0052FF] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#0052FF] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center space-x-3 mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            className="flex-grow p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
            disabled={isThinking}
          />
          <button
            onClick={onSendMessage}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isThinking
                ? "bg-gray-200 cursor-not-allowed text-gray-500"
                : "bg-[#0052FF] hover:bg-[#003ECF] text-white shadow-md"
            }`}
            disabled={isThinking}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
