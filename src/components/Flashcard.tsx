"use client";

import React from "react";
import { motion } from "framer-motion";

type FlashcardProps = {
  question: string;
  answer: string;
};

export default function Flashcard({ question, answer }: FlashcardProps) {
  const [flipped, setFlipped] = React.useState(false);

  return (
    <div
      className="relative h-60 w-96 cursor-pointer"
      style={{ perspective: "1500px" }}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <motion.div
        className="relative h-full w-full transition-transform duration-700"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border border-indigo-300 bg-gradient-to-br from-white to-indigo-50 px-6 py-8 text-center text-lg font-semibold text-indigo-900 shadow-xl transition-all duration-500 hover:shadow-indigo-400"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <span className="leading-snug">{question}</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border border-indigo-300 bg-gradient-to-br from-indigo-600 to-indigo-400 px-6 py-8 text-center text-lg font-semibold text-white shadow-xl transition-all duration-500 hover:shadow-indigo-600"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="leading-snug">{answer}</span>
        </div>
      </motion.div>
    </div>
  );
}
