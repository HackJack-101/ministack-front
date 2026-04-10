/**
 * Returns the singular or plural form of a word based on the count.
 * For this application, 0 and 1 are treated as singular as per user requirements.
 */
export const pluralize = (count: number, singular: string, plural?: string) => {
  return `${count} ${pluralizeWord(count, singular, plural)}`;
};

/**
 * Returns the word in its singular or plural form based on the count.
 * For this application, 0 and 1 are treated as singular.
 */
export const pluralizeWord = (count: number, singular: string, plural?: string) => {
  const isPlural = count > 1;
  return isPlural ? plural || `${singular}s` : singular;
};
