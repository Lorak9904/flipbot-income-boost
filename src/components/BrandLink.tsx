import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface BrandLinkProps {
  to: string;
  className?: string;
}

const BrandLink = ({ to, className }: BrandLinkProps) => (
  <Link
    to={to}
    className={cn(
      'inline-flex min-h-11 items-center font-heading text-xl font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
      className,
    )}
    aria-label="FlipIt"
  >
    <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
      FlipIt
    </span>
  </Link>
);

export default BrandLink;
