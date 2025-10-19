import React, { useState, useCallback } from 'react';
import { removeBackground } from './services/cloudinaryService';
import { ImageDisplay } from './components/ImageDisplay';
import { Spinner } from './components/Spinner';
import { UploadIcon, WandIcon, DownloadIcon } from './components/Icons';

const App: React.FC = () => {
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('cloudinary://489762938468776:drP_1bz3Mwl9nPaGE_JIGV77cFc@dywko2uaj');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setProcessedImageUrl(null);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = useCallback(async () => {
    if (!originalImage || !cloudinaryUrl) {
      setError('Please upload an image and provide your Cloudinary Secret URL.');
      return;
    }

    setIsLoading(true);
    setProcessedImageUrl(null);
    setError(null);

    try {
      const resultUrl = await removeBackground(originalImage, cloudinaryUrl);
      setProcessedImageUrl(resultUrl);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, cloudinaryUrl]);

  const handleDownload = async () => {
    if (!processedImageUrl) return;
    try {
      // Fetch the image from the URL
      const response = await fetch(processedImageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      const originalName = originalImage?.name.split('.').slice(0, -1).join('.') || 'image';
      a.download = `${originalName}-no-bg.png`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up the temporary link and URL
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Download failed:", downloadError);
      setError("Failed to download the image. Please try right-clicking the image and saving it.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Background Remover
          </h1>
          <p className="mt-2 text-lg text-gray-400">Powered by Cloudinary AI</p>
        </header>

        <main className="bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel */}
            <div className="flex flex-col space-y-6">
              <div>
                <label htmlFor="cloudinary-url" className="block text-sm font-medium text-gray-300 mb-2">
                  1. Enter Your Cloudinary Secret URL
                </label>
                <input
                  id="cloudinary-url"
                  type="password"
                  value={cloudinaryUrl}
                  onChange={(e) => setCloudinaryUrl(e.target.value)}
                  placeholder="cloudinary://api_key:api_secret@cloud_name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                 <p className="mt-2 text-xs text-gray-500">
                    Your secret is used directly in the browser and is not stored. This is for demonstration purposes only. Do not expose your secret in a production application.
                </p>
              </div>

              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
                  2. Upload an Image
                </label>
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500 rounded-lg flex justify-center items-center p-6 transition">
                    <div className="text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-300">
                            {originalImage ? `Selected: ${originalImage.name}` : 'Click to upload or drag and drop'}
                        </span>
                        <span className="block text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</span>
                    </div>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                </label>
              </div>

              <div>
                <button
                  onClick={handleRemoveBackground}
                  disabled={!originalImage || !cloudinaryUrl || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      Processing...
                    </>
                  ) : (
                    <>
                     <WandIcon className="h-5 w-5" />
                      إزالة الخلفية
                    </>
                  )}
                </button>
              </div>

              {processedImageUrl && !isLoading && (
                 <div>
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all transform hover:scale-105"
                    >
                      <DownloadIcon className="h-5 w-5" />
                      Download Image
                    </button>
                  </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
            </div>

            {/* Image Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <ImageDisplay title="Original" imageUrl={originalImageUrl} />
              <ImageDisplay title="Background Removed" imageUrl={processedImageUrl} isLoading={isLoading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;