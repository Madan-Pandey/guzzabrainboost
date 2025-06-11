import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type PbtnType = {
  message: string;
  toDestination: string;
  theme?: "dark" | "light"; // Theme prop to control the button's appearance
};

function Pbtn({ message, toDestination, theme = "light" }: PbtnType) {
  // Dynamically determine styles based on the theme prop
  const isDark = theme === "dark";

  return (
    <div>
      <Link
        href={toDestination}
        className={`relative inline-block px-6 py-3 text-sm font-bold rounded-lg shadow-lg transition-transform transform active:translate-y-1 
        ${
          isDark
            ? "text-white bg-gray-800 border-b-4 border-gray-900 hover:bg-gray-700"
            : "text-gray-900 bg-gray-100 border-b-4 border-gray-300 hover:bg-gray-200"
        }`}
      >
        {message}
      </Link>
    </div>
  );
}

export default Pbtn;
