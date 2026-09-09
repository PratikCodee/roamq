import { useState } from 'react';
import { X, MapPin, Star, Sparkles, Compass, Play } from 'lucide-react';
import type { Place } from '@/types';
import { useRouter } from '@/router/Router';

interface VideoModalProps {
  place: Place | null;
  onClose: () => void;
}

function getEmbedInfo(url: string): { isIframe: boolean; src: string } {
  if (!url) return { isIframe: false, src: '' };
  const trimmed = url.trim();

  // YouTube
  const ytMatch = trimmed.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
    return {
      isIframe: true,
      src: `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      isIframe: true,
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Google Drive
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      isIframe: true,
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  return { isIframe: false, src: trimmed };
}

export function VideoModal({ place, onClose }: VideoModalProps) {
  const { navigate } = useRouter();
  const [videoError, setVideoError] = useState(false);

  if (!place) return null;

  const embedInfo = place.videoUrl ? getEmbedInfo(place.videoUrl) : null;

  const handleMapClick = () => {
    onClose();
    navigate({ name: 'map', destinationId: place.destinationId });
  };

  const handlePlanClick = () => {
    onClose();
    navigate({ name: 'planner', destinationId: place.destinationId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-navy-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-navy-900/60 text-white backdrop-blur transition hover:bg-navy-900"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Video Container */}
        <div className="relative aspect-video w-full bg-black">
          {place.videoUrl && embedInfo ? (
            embedInfo.isIframe ? (
              <iframe
                src={embedInfo.src}
                title={place.name}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : !videoError ? (
              <video
                src={embedInfo.src}
                controls
                autoPlay
                playsInline
                onError={() => setVideoError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
                <Play size={40} className="mb-2 text-ocean-400 opacity-80" />
                <p className="text-sm font-semibold">Unable to stream video inline</p>
                <p className="mt-1 text-xs text-white/70 max-w-sm">
                  This video URL requires opening directly in a web browser.
                </p>
                <a
                  href={place.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 btn-primary text-xs py-2 px-5"
                >
                  Open Video in New Tab ↗️
                </a>
              </div>
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white/70">
              <Play size={48} className="mb-2 opacity-50" />
              <p className="text-sm">Video preview coming soon</p>
            </div>
          )}
        </div>

        {/* Modal Info Footer */}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="chip bg-ocean-100 text-ocean-700 text-xs font-semibold">
                  {place.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-navy-600">
                  <Star size={13} className="fill-sand-400 text-sand-400" /> {place.rating} ({place.reviewsCount} reviews)
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-navy-900">{place.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
                <MapPin size={14} className="text-ocean-500" /> {place.location}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleMapClick} className="btn-secondary text-xs py-2.5 px-4">
                <MapPin size={14} /> View on Map
              </button>
              <button onClick={handlePlanClick} className="btn-primary text-xs py-2.5 px-4">
                <Sparkles size={14} /> Add to Trip
              </button>
            </div>
          </div>

          {/* Seasonal Highlight Banner */}
          {place.seasonalHighlight && (
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-ocean-50 to-navy-50 border border-ocean-200 p-4 text-xs text-ocean-900">
              <p className="font-bold flex items-center gap-1.5 text-ocean-800">
                <Sparkles size={14} className="text-sand-500" /> Seasonal Recommendation:
              </p>
              <p className="mt-1 text-navy-700 leading-relaxed font-medium">
                {place.seasonalHighlight}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-navy-600 leading-relaxed line-clamp-3">
            {place.description}
          </p>
        </div>
      </div>
    </div>
  );
}
