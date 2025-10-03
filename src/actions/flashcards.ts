"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { GoogleGenAI } from "@google/genai";

// Get all flashcards for a note
export const getFlashcardsForNote = async (noteId: string) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in.");

  const flashcards = await prisma.flashCard.findMany({
    where: { noteId, note: { authorId: user.id } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      questionText: true,
      answerText: true,
    },
  });

  return flashcards;
};

// Generate and save flashcards using Gemini AI
export const generateAndSaveFlashcards = async (noteId: string) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in.");

  const note = await prisma.note.findUnique({
    where: { id: noteId, authorId: user.id },
    select: { id: true, title: true, text: true },
  });

  if (!note) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are an AI tutor. Based on the following note, generate flashcards in this strict format:

--- Flashcard ---
Question: [question]
Answer: [answer]

Note Title: ${note.title}
Note Text: ${note.text}
  `.trim();

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = result.text;
  console.log("Flashcard Generation Response:", text);

  // ✅ Improved parsing logic
  const flashcards = text
    ? Array.from(
        text.matchAll(
          /--- Flashcard ---\s*Question:\s*([\s\S]*?)\s*Answer:\s*([\s\S]*?)(?=--- Flashcard ---|$)/g
        )
      )
        .map((match) => {
          const question = match[1].trim();
          const answer = match[2].trim();
          if (question && answer) {
            return { questionText: question, answerText: answer };
          }
          return null;
        })
        .filter(Boolean) as { questionText: string; answerText: string }[]
    : [];

  console.log("Parsed Flashcards:", flashcards);

  if (flashcards.length === 0) {
    console.warn("No flashcards parsed from AI response.");
    return [];
  }

  // Save to DB
  await prisma.flashCard.createMany({
    data: flashcards.map((fc) => ({
      ...fc,
      noteId: note.id,
    })),
  });

  return flashcards;
};

export const deleteFlashcardById = async (flashcardId: string) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in.");

  // Ensure ownership before deleting
  const flashcard = await prisma.flashCard.findUnique({
    where: { id: flashcardId },
    include: { note: true },
  });

  if (!flashcard || flashcard.note.authorId !== user.id) {
    throw new Error("Unauthorized or flashcard not found.");
  }

  await prisma.flashCard.delete({
    where: { id: flashcardId },
  });

  return { success: true };
};

