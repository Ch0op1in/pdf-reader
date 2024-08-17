import { db } from "@/db";
import { messageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { openai } from "@/lib/openai";
import { streamText, generateText } from 'ai';
import { createStreamableValue } from 'ai/rsc';


export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const userId = user?.id;

  if (!userId) {
      return new Response("UNAUTHORIZED", { status: 401 });
  }

  const { fileId, message } = messageValidator.parse(body);

  const file = await db.file.findFirst({
      where: {
          id: fileId,
          userId,
      },
  });

  if (!file) {
      return new Response("No File", { status: 404 });
  }

  await db.message.create({
      data: {
          text: message,
          isUserMessage: true,
          userId,
          fileId,
      },
  });

  // Vectorize message 
  const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY, 
  });

  const pinecone = new Pinecone();

  const pineconeIndex = pinecone.Index("reeead");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
      where: {
          fileId,
      },
      orderBy: {
          createdAt: 'asc',
      },
      take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? "user" as const : "assistant" as const,
      content: msg.text,
  }));

  const stream = createStreamableValue('');

  await (async () => {

    //test textStream

    try{
      const { textStream } = await streamText({
          model: openai('gpt-3.5-turbo'),
          messages: [
              {
                  role: 'system',
                  content: 'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.',
              },
              {
                  role: 'user',
                  content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
                  
          \n----------------\n
          
          PREVIOUS CONVERSATION:
          ${formattedPrevMessages.map((message) => {
              if (message.role === 'user')
                  return `User: ${message.content}\n`;
              return `Assistant: ${message.content}\n`;
          })}
          
          \n----------------\n
          
          CONTEXT:
          ${results.map((r) => r.pageContent).join('\n\n')}
          
          USER INPUT: ${message}`,
              },
          ],
      });
    

      for await (const delta of textStream) {
          stream.update(delta);
      }

      stream.done();
    } catch(err){
      console.log(err)
    }
  })();

  return NextResponse.json({ output: stream.value });
};

export const GET = () => {
  return new Response("Method Not Allowed", { status: 405 });
};