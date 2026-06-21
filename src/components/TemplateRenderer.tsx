"use client";

import React from "react";
import { StoryData } from "@/utils/storage";
import BalloonPop from "./templates/BalloonPop";
import CinematicMemory from "./templates/CinematicMemory";
import Scrapbook from "./templates/Scrapbook";
import JourneyTimeline from "./templates/JourneyTimeline";

interface TemplateRendererProps {
  data: StoryData;
  mediaUrls: Record<string, string>;
  isInteractive?: boolean;
}

export default function TemplateRenderer({ data, mediaUrls, isInteractive = true }: TemplateRendererProps) {
  // Map theme background color
  const themeBgClasses: Record<string, string> = {
    "blush-pink": "bg-[#F8D7DA]",
    "baby-blue": "bg-[#D6EAF8]",
    "lavender": "bg-[#E8DAEF]",
    "cream": "bg-[#FFF8E7]",
    "peach": "bg-[#FAD7A0]",
    "mint-green": "bg-[#D5F5E3]",
    "light-beige": "bg-[#F8F5F2]",
    "soft-white": "bg-[#FCFCFC]",
  };

  // Map theme typography fonts
  const fontHeadingClasses: Record<string, string> = {
    "font-playfair": "font-playfair",
    "font-cormorant": "font-cormorant",
    "font-dancing": "font-dancing",
  };

  const fontBodyClasses: Record<string, string> = {
    "font-poppins": "font-poppins",
    "font-inter": "font-inter",
    "font-caveat": "font-caveat",
  };

  const themeClass = themeBgClasses[data.themeColor] || "bg-[#F8D7DA]";
  const headingFont = fontHeadingClasses[data.fontHeading] || "font-playfair";
  const bodyFont = fontBodyClasses[data.fontBody] || "font-poppins";

  const renderSelectedTemplate = () => {
    switch (data.templateId) {
      case "balloon":
        return <BalloonPop data={data} mediaUrls={mediaUrls} isInteractive={isInteractive} />;
      case "cinematic":
        return <CinematicMemory data={data} mediaUrls={mediaUrls} isInteractive={isInteractive} />;
      case "scrapbook":
        return <Scrapbook data={data} mediaUrls={mediaUrls} isInteractive={isInteractive} />;
      case "timeline":
        return <JourneyTimeline data={data} mediaUrls={mediaUrls} isInteractive={isInteractive} />;
      default:
        return <BalloonPop data={data} mediaUrls={mediaUrls} isInteractive={isInteractive} />;
    }
  };

  return (
    <div className={`w-full flex-grow flex flex-col ${themeClass} ${headingFont} ${bodyFont}`}>
      {renderSelectedTemplate()}
    </div>
  );
}
