import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

import type { UploadType } from "@/lib/types";

export const maxDuration = 30;

function isUploadType(value: string | null): value is UploadType {
  return value === "rough-cut" || value === "final-video";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const uploadType = formData.get("uploadType");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isUploadType(typeof uploadType === "string" ? uploadType : null)) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    const allowedTypes = new Set([
      "video/mp4",
      "video/quicktime",
      "video/webm"
    ]);

    if (!allowedTypes.has(fileEntry.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload MP4, MOV, or WebM." },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (fileEntry.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 100MB." }, { status: 400 });
    }

    const uploadDir = path.join("/tmp", "neurodraft-uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = fileEntry.name.split(".").pop() ?? "mp4";
    const fileId = nanoid();
    const savedName = `${fileId}.${ext}`;
    const filePath = path.join(uploadDir, savedName);
    const bytes = await fileEntry.arrayBuffer();

    await writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      fileId,
      uploadType,
      fileName: fileEntry.name,
      metadata: {
        fileId,
        fileName: fileEntry.name,
        fileSize: fileEntry.size,
        fileType: fileEntry.type,
        uploadType,
        filePath,
        durationEstimate: Math.max(10, Math.round(fileEntry.size / 2_000_000) * 10)
      },
      message: `${uploadType === "rough-cut" ? "Rough cut" : "Final video"} uploaded successfully`
    });
  } catch (error) {
    console.error("[UPLOAD] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
