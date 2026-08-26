export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  year: string;
}

export const galleryImageFiles = [
  "gallery-1.png",
  "gallery-2.png",
  "gallery-3.png",
  "gallery-4.png",
  "gallery-5.png",
  "gallery-6.png",
  "gallery-7.png",
  "gallery-8.png",
];

// Helper function to generate clean descriptive titles from filenames
function getTitleFromFilename(filename: string): string {
  const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
  let formatted = baseName
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ');

  if (formatted.startsWith("ChatGPT Image")) {
    formatted = formatted
      .replace("ChatGPT Image", "Run Highlight")
      .replace(/,\s*\d{2}_\d{2}_\d{2}\s*(?:PM|AM)/gi, "");
  }
  return formatted;
}

export const galleryImages: GalleryImage[] = galleryImageFiles.map((filename, index) => {
  const title = getTitleFromFilename(filename);
  const cleanId = `img-${index + 1}`;
  
  // Telemetry log details
  const categories = ["Race Day", "Start Line", "Support", "Finish Line", "Ceremony", "Course"];
  const years = ["2025", "2024", "2023", "2026"];
  const category = categories[index % categories.length];
  const year = years[index % years.length];

  return {
    id: cleanId,
    url: `/images/gallery/${filename}`,
    title,
    category,
    year,
  };
});
