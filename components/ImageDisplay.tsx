
import React from 'react';
import { Spinner } from './Spinner';
import { ImageIcon } from './Icons';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isLoading = false }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-center font-semibold text-gray-300">{title}</h3>
      <div className="aspect-square w-full bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center text-gray-400">
            <Spinner />
            <span className="mt-2 text-sm">Processing...</span>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={title} className="object-contain w-full h-full" />
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <ImageIcon className="h-16 w-16" />
            <span className="mt-2 text-sm">{title} image will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
};
