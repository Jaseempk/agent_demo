"use client";

import { useState, useEffect } from "react";

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
    return <div className="p-2 animate-pulse">Loading agents...</div>;
  }

  if (agents.length <= 1) {
    return null;
  }

  return (
    <div className="p-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Select Agent:
      </label>
      <select
        value={activeAgent}
        onChange={(e) => onAgentChange(e.target.value)}
        className="py-1 px-2 rounded border dark:bg-gray-700 dark:border-gray-600"
      >
        {agents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>
    </div>
  );
}
