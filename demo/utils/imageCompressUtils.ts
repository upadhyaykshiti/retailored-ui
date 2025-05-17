export const compressImage = async (file: File, maxSizeMB = 1): Promise<File | null> => {
  return new Promise((resolve) => {
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        let width = img.width;
        let height = img.height;
        const quality = 0.7;
        let attempts = 0;
        const maxAttempts = 5;

        const attemptCompression = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null);
              return;
            }

            if (blob.size <= maxSizeMB * 1024 * 1024 || attempts >= maxAttempts) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              width *= 0.9;
              height *= 0.9;
              attempts++;
              attemptCompression();
            }
          }, 'image/jpeg', quality);
        };

        attemptCompression();
      };
      img.onerror = () => resolve(null);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};