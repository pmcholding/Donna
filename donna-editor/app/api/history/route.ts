import { NextRequest, NextResponse } from "next/server";
import { getCommitHistory, getFileAtCommit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commitSha = searchParams.get("sha");

  try {
    // Se sha fornecido, busca conteúdo desse commit
    if (commitSha) {
      const content = await getFileAtCommit(commitSha);
      return NextResponse.json({ content });
    }

    // Senão, lista histórico de commits
    const history = await getCommitHistory(10);
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
