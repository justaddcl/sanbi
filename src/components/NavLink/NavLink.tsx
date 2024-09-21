import Link from "next/link";
import React from "react";
import { NavLinkElement } from "@components/NavLink/NavLinkElement";

type NavLinkProps = React.PropsWithChildren & {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
};

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  active,
  icon,
  children,
}) => {
  const activeLinkStyling = active
    ? "bg-slate-200 mx-[-16px] px-4 hover:bg-slate-200"
    : "";
  const colorStyles = active
    ? "text-slate-700"
    : "text-slate-400 hover:text-slate-600";
  const activeTextStyle = active ? "font-semibold" : "";

  const ForwardedNavLinkElement = React.forwardRef(NavLinkElement);

  return (
    <Link href={href} passHref legacyBehavior>
      <ForwardedNavLinkElement
        text={children}
        icon={icon}
        className={`flex gap-4 rounded py-2 align-middle text-lg leading-5 hover:mx-[-8px] hover:bg-slate-100 hover:px-2 active:bg-slate-300 lg:gap-3 lg:text-sm lg:hover:mx-[-16px] lg:hover:px-4 ${colorStyles} ${activeLinkStyling} ${activeTextStyle}`}
      />
    </Link>
  );
};
