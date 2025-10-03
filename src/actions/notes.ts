"use server";

import { getUser } from "@/auth/server";
// import { getRequiredUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

export const updateNoteAction = async (noteId: string, text: string) => {
  try {
    const user = await getUser();
    // const user = await getRequiredUser();
    if (!user) {
      throw new Error("You must be logged in to update a note");
    }
    await prisma.note.update({
      where: { id: noteId },
      data: { text },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    // const user = await getRequiredUser();
    if (!user) {
      throw new Error("You must be logged in to create a note");
    }
    await prisma.note.create({
      data: {
        id: noteId,
        authorId: user.id,
        text: "",
        title: "",
      },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    // const user = await getRequiredUser();
    if (!user) {
      throw new Error("You must be logged in to delete a note");
    }
    await prisma.note.delete({
      where: { id: noteId, authorId: user.id },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateNoteTitleAction = async (noteId: string, title: string) => {
  try {
    const user = await getUser();
    // const user = await getRequiredUser();
    if (!user) {
      throw new Error("You must be logged in to update a note");
    }
    await prisma.note.update({
      where: { id: noteId },
      data: { title },
    });
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const askAIAboutNotesAction = async (
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  // const user = await getRequiredUser();
  if (!user) {
    throw new Error("You must be logged in to ask AI questions");
  }
  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (notes.length === 0) {
    return "You don't have any notes yet";
  }
  const formattedNotes = notes
    .map((note) =>
      `
            Title: ${note.title}
            Text: ${note.text}
            Created at: ${note.createdAt}
            Last Updated: ${note.updatedAt}
            `.trim(),
    )
    .join("\n");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const messages: { role: string; content: string }[] = [
    {
      role: "developer",
      content: `
              You are a helpful assistant that answers questions about a user's notes. 
              Assume all questions are related to the user's notes. 
              Make sure that your answers are not too verbose and you speak succinctly. 
              Your responses MUST be formatted in clean, valid HTML with proper structure. 
              Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
              Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
              Avoid inline styles, JavaScript, or custom attributes.
              
              Rendered like this in JSX:
              <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />

        
              Here are the user's notes:
              ${formattedNotes}
              `,
    },
  ];

  // Adding the user's conversation history
  //   for (let i = 0; i < newQuestions.length; i++) {
  //     messages.push({ role: "user", content: newQuestions[i] });
  //     if (responses.length > i) {
  //       messages.push({ role: "model", content: responses[i] });
  //     }
  //   }

  for (let i = 0; i < newQuestions.length; i++) {
    messages.push({ role: "user", content: newQuestions[i] });
    if (responses.length > i && responses[i]) {
      messages.push({ role: "model", content: responses[i] });
    }
  }

//   console.log("messages" + messages)
//   console.log("GEMINI_API_KEY" + process.env.GEMINI_API_KEY)

  const completion = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: messages.map(message => ({ text: message.content })),
  });

  console.log(completion.text)
  return completion.text?.replace(/```html|```/g, "").trim() || "A problem has occurred";


//   return completion.text || "A problem has occured";
};
