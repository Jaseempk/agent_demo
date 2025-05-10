"use client";

import AgentCreator from "../components/AgentCreator";
import Link from "next/link";

export default function CreateAgentPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-8">
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create a New Agent</h1>
        <Link href="/">
          <button className="px-4 py-2 rounded-full font-semibold bg-gray-500 hover:bg-gray-600 text-white shadow-md flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </button>
        </Link>
      </div>
      <AgentCreator />
    </div>
  );
}
