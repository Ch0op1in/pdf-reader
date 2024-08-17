import { db } from "@/db";
import { messageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    
    const body = await req.json

    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const userId = user?.id

    if(!userId){
        return new Response("UNAUTHORIZED", {status: 401})
    }

    const {fileId, message} = messageValidator.parse(body)

    const file = await db.file.findFirst({
        where:{
            id: fileId,
            userId
        }
    })

    if(!file){
        return new Response("No File", {status: 404})
    }

    await db.message.create({
        data:{
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })
}