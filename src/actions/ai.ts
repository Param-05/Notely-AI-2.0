"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { GoogleGenAI } from "@google/genai";

// Action: Ask AI About Notes
export const askAIAboutNotesAction = async (
  noteId: string,
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to ask AI questions");
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      authorId: user.id,
    },
    select: {
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!note) {
    return "The selected note could not be found.";
  }

  const formattedNote = [
    `Title: ${note.title}`,
    `Text: ${note.text}`,
    `Created at: ${note.createdAt}`,
    `Last Updated: ${note.updatedAt}`,
  ].join("\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const contents: any[] = [
    {
      role: "user",
      parts: [
        {
          text: `
You are an AI tutor that answers questions about a user's selected note. Speak succinctly and format in clean, valid HTML (using <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <br>). Avoid inline styles or custom attributes.

Here is the user's selected note:
${formattedNote}
          `.trim(),
        },
      ],
    },
  ];

  // Include past Q&A context
  if (newQuestions.length > 0) {
    const history = newQuestions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${responses[i] || ""}`)
      .join("\n\n");

    contents.push({
      role: "user",
      parts: [{ text: history }],
    });
  }

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  // safely get the output text
  return result.text?.replace(/```html|```/g, "").trim() || "A problem has occurred";

};


// Action: Generate MCQs
export const generateMCQsAction = async (
  noteId: string,
  previousQuestions: string[] = []
) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in.");

  const note = await prisma.note.findFirst({
    where: { id: noteId, authorId: user.id },
    select: {
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!note) {
    return "The selected note could not be found.";
  }

  const formattedNote = `
Title: ${note.title}
Text: ${note.text}
Created at: ${note.createdAt}
Updated at: ${note.updatedAt}
  `.trim();

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let prompt = `
You are an AI tutor. Based on the following note, generate 10 **new** multiple choice questions (MCQs) with 4 options each. Only one option should be correct.

If any previous questions are provided, do not repeat them. Format each MCQ strictly in HTML using:
<p> for the question,
<ul><li> for the options, and
<strong>Answer:</strong> [Correct option] for the correct answer.

Avoid inline styles or custom tags. Keep it clean and clear.

Note:
${formattedNote}
`;

  if (previousQuestions.length > 0) {
    const prevContent = previousQuestions
      .map((q, i) => `Previous Q${i + 1}: ${q}`)
      .join("\n");
    prompt += `

These questions were already generated before:
${prevContent}
`;
  }

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  return result.text?.replace(/```html|```/g, "").trim() || "Failed to generate MCQs.";
};

// Action: Smart Lookup

export const smartLookupAction = async (question: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to use Smart Lookup.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are a knowledgeable AI assistant. Provide a short, factual answer in a few words

Question: ${question}
`;

console.log("Smart Lookup Prompt:", prompt);

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const response = result.text;
  console.log("Smart Lookup Response:", response);
  return response;
};


export const summarizeNoteAction = async (noteId: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to summarize your notes.");
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      authorId: user.id,
    },
    select: {
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!note) {
    return "The selected note could not be found.";
  }

  const formattedNote = [
    `Title: ${note.title}`,
    `Text: ${note.text}`,
    `Created at: ${note.createdAt}`,
    `Last Updated: ${note.updatedAt}`,
  ].join("\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are an AI tutor. Summarize the following student's note into a helpful study summary for last minute before exam. Use clear language. Format the summary in clean HTML using only valid tags (<p>, <ul>, <li>, etc). Avoid inline styles or extra spacing.


Note:
${formattedNote}
  `.trim();

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  return result.text?.replace(/```html|```/g, "").trim() || "An error occurred while summarizing your notes.";
};