/**
 * Converts various image formats to base64 data URL
 * @param imageUrl - The image URL to convert (can be blob URL, web URL, or already base64)
 * @returns Promise<string> - Base64 encoded image data URL
 */
export const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
  
    try {
      let blob: Blob;
      
      if (imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        blob = await response.blob();
      }
      else if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl);
        blob = await response.blob();
      }
      else {
        return imageUrl;
      }
  
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return imageUrl;
    }
};
  
/**
 * Converts multiple images to base64 data URLs
 * @param imageUrls - Array of image URLs to convert
 * @returns Promise<string[]> - Array of base64 encoded image data URLs
 */
export const convertImagesToBase64 = async (imageUrls: string[]): Promise<string[]> => {
    return Promise.all(imageUrls.map(url => convertImageToBase64(url)));
};