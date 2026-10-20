import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { buttonClass, ButtonSize, ButtonVariant } from "../../utils/buttonStyles";
import { BoxIcon } from "lucide-react";
interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: BoxIcon;
}
export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return <Link {...rest} className={buttonClass(variant, size, typeof className === 'string' ? className : undefined)}>
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />}
      {children}
    </Link>;
}