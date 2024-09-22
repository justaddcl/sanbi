"use client";

import { useSanbiStore } from "@/providers/sanbi-store-provider";
import React from "react";

type NavLinkElementProps = {
  text?: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
};

export const NavLinkElement: React.ForwardRefRenderFunction<
  HTMLAnchorElement,
  NavLinkElementProps
> = ({ text, href, icon, onClick, className }, ref) => {
  const { closeMobileNav } = useSanbiStore((state) => state);

  const onClickHandler = (
    clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    onClick?.(clickEvent);
    closeMobileNav();
  };

  return (
    <a
      className={className}
      href={href}
      onClick={(clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
        onClickHandler(clickEvent)
      }
      ref={ref}
    >
      <span className={`my-auto grid size-5 place-items-center lg:size-4`}>
        {icon}
      </span>
      {text}
    </a>
  );
};
