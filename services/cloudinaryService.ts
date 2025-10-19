/**
 * WARNING: This client-side implementation includes the API secret for signing.
 * This is a major security risk in a production environment.
 * The API secret should only be used on a secure backend server.
 * This implementation is for demonstration purposes only, fulfilling the request
 * to build a self-contained frontend application.
 *
 * This file replaces the requested server-side "Genkit flow".
 */

// Helper function to create a SHA-1 hash using the Web Crypto API
async function sha1(data: string): Promise<string> {
    const buffer = new TextEncoder().encode(data); // Use TextEncoder for proper UTF-8 encoding
    const digest = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

interface CloudinaryCredentials {
    apiKey: string;
    apiSecret: string;
    cloudName: string;
}

// Parses the Cloudinary URL (e.g., cloudinary://api_key:api_secret@cloud_name)
function parseCloudinaryUrl(url: string): CloudinaryCredentials {
    const match = url.match(/^cloudinary:\/\/(\w+):(.+)@(\w+)$/);
    if (!match) {
        throw new Error('Invalid Cloudinary Secret URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
    }
    const [, apiKey, apiSecret, cloudName] = match;
    return { apiKey, apiSecret, cloudName };
}

export async function removeBackground(file: File, cloudinaryUrl: string): Promise<string> {
    const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl(cloudinaryUrl);
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Using an eager transformation is a more robust method for background removal
    const eagerTransformation = 'e_background_removal';

    // The signature must be created from the parameters being sent, sorted alphabetically.
    // 'eager' comes before 'timestamp'.
    const paramsToSign = `eager=${eagerTransformation}&timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(paramsToSign);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('eager', eagerTransformation); // Use eager transformation

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error?.message?.includes('Invalid signature')) {
                throw new Error(`Cloudinary Error: Invalid signature. Please check your API Secret.`);
            }
            if (data.error?.message?.includes('add-on')) {
                 throw new Error('Cloudinary Error: The AI Background Removal add-on might not be enabled on your account.');
            }
            throw new Error(data.error?.message || 'Failed to upload image to Cloudinary.');
        }

        // With eager transformations, the result is in the 'eager' array
        if (!data.eager || data.eager.length === 0 || !data.eager[0].secure_url) {
            console.error('Cloudinary response did not include an eager transformation result.', data);
            throw new Error('Background removal failed. The transformed image URL was not found in the response. Please ensure the "AI Background Removal" add-on is enabled in your Cloudinary account.');
        }

        return data.eager[0].secure_url; // Return the URL of the transformed image
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        if (error instanceof Error && error.message.startsWith('Cloudinary Error:')) {
            throw error;
        }
        throw new Error('Could not process the image. Please check your Cloudinary URL and network connection.');
    }
}