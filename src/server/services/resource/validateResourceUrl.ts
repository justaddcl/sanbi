import { TRPCError } from "@trpc/server";

import {
  UrlValidationError,
  validateUrl,
} from "@server/utils/urls/validateUrl";

export const validateResourceUrl = (input: string) => {
  try {
    return validateUrl(input);
  } catch (error) {
    if (error instanceof UrlValidationError) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message,
        cause: error,
      });
    }

    throw error;
  }
};
