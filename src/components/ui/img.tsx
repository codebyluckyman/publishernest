
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

const Image = ({ 
  src, 
  alt, 
  className, 
  fallback = null, 
  ...props 
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <>
      {(!isLoaded || hasError) && (
        <div className={cn(
          "bg-gray-100 flex items-center justify-center",
          className
        )}>
          {fallback || (
            <div className="text-gray-400 text-xs">Image not available</div>
          )}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          className,
          (!isLoaded || hasError) ? "hidden" : ""
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
};

export default Image;
