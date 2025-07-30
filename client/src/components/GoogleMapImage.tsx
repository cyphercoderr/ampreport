import { useEffect } from "react";

interface GoogleMapImageProps {
  location: string;
  imageURL: string | null;
  setImageUrl: (url: string | null) => void;
  setImageLoaded: (loaded: boolean) => void;
}

const GoogleMapImage = ({
  location,
  imageURL,
  setImageUrl,
  setImageLoaded,
}: GoogleMapImageProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API;

  useEffect(() => {
    if (location && apiKey) {
      const fetchImage = async () => {
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=12&size=600x400&maptype=satellite&key=${apiKey}`;
        setImageUrl(staticMapUrl ?? null);
        setImageLoaded(false);
      };

      fetchImage();
    }
  }, [location, apiKey, setImageUrl, setImageLoaded]);

  return (
    <div className="map-container">
      {imageURL ? (
        <img
          src={imageURL}
          alt={`Map of ${location}`}
          className="w-full h-auto"
          onLoad={() => setImageLoaded(true)}
        />
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default GoogleMapImage;
