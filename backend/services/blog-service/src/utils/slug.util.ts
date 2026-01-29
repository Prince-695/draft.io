// Slug generation utility for blog URLs

/**
 * Generate URL-friendly slug from title
 * Converts "Hello World!" → "hello-world"
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate unique slug by appending number if slug already exists
 * @param baseSlug - The base slug to start with
 * @param checkExistsFn - Async function to check if slug exists
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  checkExistsFn: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await checkExistsFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};
