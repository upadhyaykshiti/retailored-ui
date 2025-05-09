/**
 * Constructs full image URL from filename
 * @param filename - The image filename from API
 * @param type - The image type (materials, sales_order, etc.)
 * @returns string - Full image URL
 */
export const getImageUrl = (filename: string, type: 'job_order' | 'sales_order' = 'job_order'): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/graphql', '') || '';
  return `${baseUrl}/storage/images/${type}/${filename}`;
};