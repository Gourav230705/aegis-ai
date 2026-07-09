import { z } from 'zod';

export const CompanyResearchInputSchema = z.object({
  // Allows alphanumeric characters, spaces, and basic punctuation (., -, &)
  // Prevents common injection characters like <, >, ;, $, etc.
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name is too long')
    .regex(
      /^[a-zA-Z0-9\s.,&-]+$/,
      'Company name contains invalid characters. Only alphanumeric characters, spaces, and basic punctuation (., -, &) are allowed.'
    ),
  ticker: z
    .string()
    .min(1, 'Ticker is required')
    .max(10, 'Ticker is too long')
    .regex(/^[A-Z0-9.-]+$/, 'Ticker must contain only uppercase letters, numbers, dots, and hyphens')
    .optional(),
});

export type CompanyResearchInput = z.infer<typeof CompanyResearchInputSchema>;

export function sanitizeAndValidateInput(input: unknown) {
  return CompanyResearchInputSchema.safeParse(input);
}
