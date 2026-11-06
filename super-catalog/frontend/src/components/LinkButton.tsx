import { Link, type LinkProps } from 'react-router';

interface Props extends LinkProps {
  variant?: string;
  size?: 'sm' | 'lg';
}

/**
 * A link styled as a Bootstrap button, for buttons that open another page. It stays a link
 * (role "link"), because that's what it does.
 */
export function LinkButton({ variant = 'primary', size, className, ...props }: Props) {
  const classes = ['btn', `btn-${variant}`, size && `btn-${size}`, className].filter(Boolean).join(' ');
  return <Link {...props} className={classes} />;
}
