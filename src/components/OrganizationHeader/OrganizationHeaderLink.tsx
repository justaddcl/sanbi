"use client";

import { useSanbiStore } from "@/providers/sanbi-store-provider";
import React from "react";
import { Text } from "@components/Text";

type NavLinkElementProps = {
  organizationName: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const OrganizationHeaderLink: React.ForwardRefRenderFunction<
  HTMLAnchorElement,
  NavLinkElementProps
> = ({ organizationName, href, onClick }, ref) => {
  const { closeMobileNav } = useSanbiStore((state) => state);

  const onClickHandler = (
    clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    onClick?.(clickEvent);
    closeMobileNav();
  };

  const organizationInitials = organizationName
    ?.split(" ")
    .map((word: string) => word[0])
    .join("");

  return (
    <a
      className="mb-8 flex items-center gap-3 lg:fixed lg:top-6"
      href={href}
      onClick={(clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
        onClickHandler(clickEvent)
      }
      ref={ref}
    >
      <div className="flex size-8 place-content-center rounded bg-slate-200 py-1">
        {/* TODO: determine how to style if more than two letter initials */}
        <Text
          style="header-medium-semibold"
          color="slate-700"
          className="inline-block"
          lineHeight="normal"
        >
          {organizationInitials}
        </Text>
      </div>
      <Text style="header-medium-semibold" color="slate-700">
        {organizationName}
      </Text>
    </a>
  );
};
