import type { Resource } from "@lib/types";

export type SharedResourceFormProps = {
  className?: string;
  layout?: "default" | "compact";
  onCancel?: () => void;
  onSuccess: () => void;
};

export type CreateResourceFormProps = {
  mode: "create";
  songId: string;
  organizationId: string;
  resource?: never;
};

export type UpdateResourceFormProps = {
  mode: "edit";
  resource: Resource;
  songId?: never;
  organizationId?: never;
};

export type ResourceFormProps = (
  | CreateResourceFormProps
  | UpdateResourceFormProps
) &
  SharedResourceFormProps;

export type ResourceFormControllerProps =
  | CreateResourceFormProps
  | UpdateResourceFormProps;
