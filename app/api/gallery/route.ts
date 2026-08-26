import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const galleryDir = path.join(process.cwd(), "public", "images", "gallery");

    if (!fs.existsSync(galleryDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(galleryDir);
    const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.includes(ext);
      })
      .map((file) => {
        const filePath = path.join(galleryDir, file);
        const stats = fs.statSync(filePath);

        // Generate Title from filename (e.g. "marathon-start.jpg" -> "Marathon Start")
        const baseName = path.basename(file, path.extname(file));
        const title = baseName
          .replace(/[_-]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          id: file,
          url: `/images/gallery/${file}`,
          title,
          mtime: stats.mtimeMs,
          category: getCategoryFromFilename(baseName),
          year: getYearFromFilename(baseName),
        };
      })
      // Sort naturally by filename (gallery-1.png, gallery-2.png, ...)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    return NextResponse.json(images);

  } catch (error) {
    console.error("Failed to read gallery folder:", error);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}

function getCategoryFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("start")) return "Start Line";
  if (lower.includes("finish")) return "Finish Line";
  if (lower.includes("run")) return "Race Day";
  if (lower.includes("support") || lower.includes("hydration")) return "Support";
  if (lower.includes("award") || lower.includes("ceremony") || lower.includes("sachin")) return "Ceremony";
  return "Race Day";
}

function getYearFromFilename(filename: string): string {
  const match = filename.match(/\b(202[3-6])\b/);
  return match ? match[1] : "2026";
}
