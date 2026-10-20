import React from "react";
import { Loader2Icon, BoxIcon } from "lucide-react";
import { buttonClass, ButtonSize, ButtonVariant } from "../../utils/buttonStyles";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: BoxIcon;
  loading?: boolean;
}
export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconCls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return <button {...rest} type={type} disabled={disabled || loading} className={buttonClass(variant, size, className)}>
      {loading ? <Loader2Icon className={`${iconCls} animate-spin`} aria-hidden /> : Icon ? <Icon className={iconCls} aria-hidden /> : null}
      {children}
    </button>;
}