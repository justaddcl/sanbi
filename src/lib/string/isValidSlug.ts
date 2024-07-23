const invalidUrlSlugRegex = new RegExp("([^\\w-]+|[_])");

export const isValidSlug = (slug: string) => !invalidUrlSlugRegex.test(slug);
