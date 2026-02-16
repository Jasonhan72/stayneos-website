import { MetadataRoute } from "next";
import { mockProperties } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  // Use environment variable or fallback to production domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stayneos.com";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/landlords`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/corporate`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // Dynamic property pages
  const propertyPages = mockProperties.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: property.images.map((image) => ({
      url: image.startsWith("http") ? image : `${baseUrl}${image}`,
      title: property.title,
      caption: `${property.title} - ${property.location}`,
    })),
  }));

  return [...staticPages, ...propertyPages];
}
