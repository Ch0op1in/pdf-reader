import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    
    const body = await req.json

    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const userId = user?.id

    if(!userId){
        return new NextResponse("UNAUTHORIZED", {status: 401})
    }

    const { } = 1
}