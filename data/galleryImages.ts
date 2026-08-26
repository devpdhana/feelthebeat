export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  year: string;
}

export const galleryImageFiles = [
  "ChatGPT Image Aug 4, 2026, 05_39_26 PM.png",
  "ChatGPT Image Aug 4, 2026, 05_43_12 PM.png",
  "ChatGPT Image Aug 4, 2026, 05_45_13 PM.png",
  "ChatGPT Image Aug 5, 2026, 10_47_15 AM.png",
  "ChatGPT Image Aug 5, 2026, 10_48_18 AM.png",
  "ChatGPT Image Aug 5, 2026, 10_51_00 AM.png",
  "ChatGPT Image Aug 5, 2026, 11_04_20 AM.png",
  "ChatGPT Image Aug 5, 2026, 11_05_32 AM.png",
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
