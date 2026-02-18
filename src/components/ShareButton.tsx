"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share2, Linkedin, Link2, Check, Mail
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  contentType: string;
  contentId: string;
}

export default function ShareButton({ 
  title, 
  description, 
  url,
  contentType, 
  contentId 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || `Check out ${title} on MatricMaster AI`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track share
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          sharePlatform: "copy",
        }),
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToSocial = async (platform: string) => {
    let platformUrl = "";
    
    switch (platform) {
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(description || title)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        platformUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;
        break;
      case "email":
        platformUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`;
        break;
    }

    if (platformUrl) {
      window.open(platformUrl, "_blank", "width=600,height=400");
      
      // Track share
      try {
        await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType,
            contentId,
            sharePlatform: platform,
          }),
        });
      } catch (err) {
        console.error("Failed to track share:", err);
      }
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {title}</DialogTitle>
            <DialogDescription>
              Share this content with your friends and study partners
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Social Media Buttons */}
            <div className="grid grid-cols-5 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocial("facebook")}
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocial("twitter")}
                className="hover:bg-sky-50 hover:border-sky-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocial("linkedin")}
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocial("whatsapp")}
                className="hover:bg-green-50 hover:border-green-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocial("email")}
                className="hover:bg-gray-50 hover:border-gray-300"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
              />
              <Button onClick={copyToClipboard} variant="secondary">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
