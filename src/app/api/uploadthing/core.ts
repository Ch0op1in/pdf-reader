import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { uploadStatus } from "@prisma/client";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";


const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
    
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if(!user || !user?.id ){
            throw new Error("UNAUTHORIZESD")
        }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {  
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: "PROCESSING"
        }
      })

      try {
        const response = await fetch(createdFile.url)
        const blob = await response.blob()
        const loader = new PDFLoader(blob)
        const pageLevelDocs = await loader.load()
        const pagesAmt = pageLevelDocs.length

        // Vectorize the docu

        const pinecone = new Pinecone

        const pineconeIndex = pinecone.Index("reeead")

        const embeddings = new OpenAIEmbeddings({
          apiKey: process.env.OPENAI_API_KEY, 
        })

        await PineconeStore.fromDocuments(
          pageLevelDocs, 
          embeddings, {
          pineconeIndex,
          namespace: createdFile.id
        })

        await db.file.update({
          data:{
            uploadStatus: "SUCCESS"
          },
          where:{
            id: createdFile.id
          }
        })

      } catch (error) {
        await db.file.update({
          data:{
            uploadStatus: "FAILED"
          },
          where:{
            id: createdFile.id
          }
        })
      }

      }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;