import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["approve", "dismiss"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // In production, update flag in database
    return NextResponse.json({ 
      success: true, 
      flagId: id, 
      action,
      reviewedBy: session.user.id 
    });
  } catch (error) {
    console.error("Error reviewing flag:", error);
    return NextResponse.json(
      { error: "Failed to review flag" },
      { status: 500 }
    );
  }
}
