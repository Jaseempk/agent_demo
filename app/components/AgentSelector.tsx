"use client";

import { useState, useEffect, useRef } from "react";

type AgentSelectorProps = {
  activeAgent: string;
  onAgentChange: (agentName: string) => void;
};

/**
 * A component that allows users to select from available agents
 */
export default function AgentSelector({
  activeAgent,
  onAgentChange,
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<string[]>(["default"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate loading available agents
  // In a real implementation, this would fetch the list from an API
  useEffect(() => {
    const storedAgents = localStorage.getItem("availableAgents");

    if (storedAgents) {
      try {
        const agentList = JSON.parse(storedAgents);
        if (Array.isArray(agentList) && !agentList.includes("default")) {
          agentList.unshift("default");
        }
        setAgents(agentList);
      } catch (e) {
        console.error("Error parsing stored agents:", e);
      }
    }

    setIsLoading(false);
  }, []);

  // When a new agent is created, update the list
  useEffect(() => {
    const handleAgentCreated = (event: StorageEvent) => {
      if (event.key === "availableAgents") {
        try {
          const agentList = JSON.parse(event.newValue || "[]");
          if (Array.isArray(agentList) && !agentList.includes("default")) {
            agentList.unshift("default");
          }
          setAgents(agentList);
        } catch (e) {
          console.error("Error parsing agents from storage event:", e);
        }
      }
    };

    window.addEventListener("storage", handleAgentCreated);
    return () => window.removeEventListener("storage", handleAgentCreated);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (agents.length <= 1) {
    return null;
  }

  // Get agent icon based on name
  const getAgentIcon = (name: string) => {
    // Simple SVG icons based on first letter
    const letter = name.charAt(0).toLowerCase();

    if (letter === "d" && name === "default") {
      // Default agent icon
      return (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="currentColor"
          />
          <path
            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
            fill="currentColor"
          />
        </svg>
      );
    }

    // Other agent icons based on first letter
    return (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          fill="currentColor"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
        >
          {letter.toUpperCase()}
        </text>
      </svg>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-opacity-50"
      >
        <span className="text-[#0052FF] dark:text-[#3b82f6]">
          {getAgentIcon(activeAgent)}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {activeAgent}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full min-w-[180px] rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10 opacity-0 animate-[fadeIn_0.2s_ease-in-out_forwards]">
          <ul className="py-1 max-h-60 overflow-auto">
            {agents.map((agent) => (
              <li key={agent}>
                <button
                  onClick={() => {
                    onAgentChange(agent);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    activeAgent === agent
                      ? "bg-gray-50 dark:bg-gray-700/50 text-[#0052FF] dark:text-[#3b82f6]"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={
                        activeAgent === agent
                          ? "text-[#0052FF] dark:text-[#3b82f6]"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      {getAgentIcon(agent)}
                    </span>
                    <span>{agent}</span>
                  </div>
                  {activeAgent === agent && (
                    <svg
                      className="w-4 h-4 text-[#0052FF] dark:text-[#3b82f6]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
