"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ShareButtonProps {
  score?: number;
  levelTitle?: string;
  levelNumber?: number;
  accuracy?: number;
  totalScore?: number;
}

const ShareButton = ({ score, levelTitle, levelNumber, accuracy, totalScore }: ShareButtonProps) => {
  const websiteUrl = "https://guhuzaquiz.com/";
  
  // Generate share message based on props
  const generateShareMessage = (platform: string) => {
    if (!score || !levelTitle) {
      return "🎮 Check out Guhuza Quiz - Level up your job search skills! 🚀";
    }

    // Create platform-specific messages
    const baseMessage = `🎯 Scored ${score} points in ${levelTitle} (Level ${levelNumber}) with ${accuracy}% accuracy! Total: ${totalScore}pts\n🎮 Can you beat my score on Guhuza Quiz?`;

    // For platforms that support it, add URL in message
    if (platform === 'whatsapp' || platform === 'telegram') {
      return `${baseMessage}\n\n${websiteUrl}`;
    }

    return baseMessage;
  };

  const shareLinks = [
    {
      name: "X",
      platform: "twitter",
      icon: "/social/x.svg",
      bgGradient: "from-neutral-950 via-neutral-900 to-neutral-800"
    },
    {
      name: "Facebook",
      platform: "facebook",
      icon: "/social/facebook.svg",
      bgGradient: "from-blue-600 via-blue-500 to-blue-400"
    },
    {
      name: "LinkedIn",
      platform: "linkedin",
      icon: "/social/linkedin.svg",
      bgGradient: "from-blue-700 via-blue-600 to-blue-500"
    },
    {
      name: "WhatsApp",
      platform: "whatsapp",
      icon: "/social/whatsapp.svg",
      bgGradient: "from-green-500 via-green-400 to-emerald-400"
    },
    {
      name: "Telegram",
      platform: "telegram",
      icon: "/social/telegram.svg",
      bgGradient: "from-sky-600 via-sky-500 to-blue-500"
    }
  ];

  const handleShare = (platform: string) => {
    const shareMessage = generateShareMessage(platform);
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        // Twitter supports text parameter
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(websiteUrl)}`;
        break;
        
      case "facebook":
        // Facebook only allows sharing URLs, not custom messages
        // Use the simpler sharer.php which works more reliably
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}`;
        break;
        
      case "linkedin":
        // Updated LinkedIn sharing URL - only supports URL sharing
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(websiteUrl)}`;
        break;
        
      case "whatsapp":
        // WhatsApp supports custom text
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
        break;
        
      case "telegram":
        // Telegram supports custom text
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodeURIComponent(shareMessage)}`;
        break;
    }

    if (shareUrl) {
      const width = 550;
      const height = 450;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      window.open(shareUrl, 'share', 
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );
    }
  };

  // Add a copy to clipboard fallback for platforms that don't support custom messages
  const copyToClipboard = async (platform: string) => {
    const shareMessage = generateShareMessage(platform);
    const fullMessage = `${shareMessage}\n\n${websiteUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullMessage);
      // You might want to show a toast notification here
      console.log('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy message: ', err);
    }
  };

  return (
    <>
      {shareLinks.map((platform) => (
        <div key={platform.name} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100 animate-pulse-slow"></div>
          <div className="relative flex flex-col items-center gap-3">
            <button
              onClick={() => handleShare(platform.platform)}
              onDoubleClick={() => copyToClipboard(platform.platform)} // Double-click to copy message
              className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl relative overflow-hidden"
              title={`Share on ${platform.name} (Double-click to copy message)`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${platform.bgGradient} opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_40%,rgba(255,255,255,0.2)_50%,transparent_60%,transparent_100%)] group-hover:animate-shimmer"></div>
              <Image 
                src={platform.icon} 
                alt={platform.name} 
                width={24} 
                height={24} 
                className="relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert transform group-hover:scale-110"
              />
            </button>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
              {platform.name}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default ShareButton;