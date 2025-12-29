import { NextRequest, NextResponse } from "next/server";
import { getFileContent, updateFileContent } from "@/lib/github";

export async function GET() {
  try {
    const { content, sha } = await getFileContent();
    return NextResponse.json({ content, sha });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { content, sha, message } = await request.json();

    if (!content || !sha) {
      return NextResponse.json(
        { error: "Missing content or sha" },
        { status: 400 }
      );
    }

    const newSha = await updateFileContent(content, sha, message);
    return NextResponse.json({ sha: newSha });
  } catch (error) {
    console.error("Error saving file:", error);

    // Check for conflict error (file was modified)
    if (error instanceof Error && error.message.includes("409")) {
      return NextResponse.json(
        { error: "File was modified. Please refresh and try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }
}
