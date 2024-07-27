import { TRPCError } from "@trpc/server";

export class SanbiError extends TRPCError {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore override doesn't work in all environments due to "This member cannot have an 'override' modifier because it is not declared in the base class 'Error'"
  public readonly code;

  constructor({
    message,
    code,
    cause,
  }: {
    message?: string;
    code: TRPCError["code"];
    cause?: TRPCError["cause"];
  }) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore https://github.com/tc39/proposal-error-cause
    super({ message, code, cause });

    this.name = "SanbiError";
  }
}
