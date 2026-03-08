import { checkAndSendNotificationsAction } from "@/app/actions/notification-actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: NextRequest) {
  // Basic security check (e.g. secret token if dealing with external Cron provider like Vercel Cron)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    console.log("Running notification check...");
    const result = await checkAndSendNotificationsAction();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
