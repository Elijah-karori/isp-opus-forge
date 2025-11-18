import { Link, LinkProps, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  end?: boolean;
}

export function NavLink({ 
  to, 
  children, 
  className, 
  activeClassName = 'bg-accent text-accent-foreground', 
  end = false,
  ...props 
}: NavLinkProps) {
  const location = useLocation();
  const path = typeof to === 'string' ? to : to.pathname || '';
  
  const isActive = end 
    ? location.pathname === path
    : location.pathname.startsWith(path);

  return (
    <Link
      to={to}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}
