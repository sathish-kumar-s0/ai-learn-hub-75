import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
}

export const VideoPlayer = ({ videoUrl, title, thumbnail }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <Card className="overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        {!isPlaying && thumbnail ? (
          <div className="relative h-full w-full">
            <img
              src={thumbnail}
              alt={title || "Video thumbnail"}
              className="h-full w-full object-cover"
            />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/50"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110">
                <Play className="h-10 w-10 fill-primary text-primary" />
              </div>
            </button>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={title || "Video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </AspectRatio>
    </Card>
  );
};
