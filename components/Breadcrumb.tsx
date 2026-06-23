import Link from 'next/link';
import { Fragment } from 'react';

type Crumb = { href?: string; label: string };

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-caption text-text-muted">
      {crumbs.map((c, i) => (
        <Fragment key={`${c.label}-${i}`}>
          {i > 0 && <span className="mx-1.5 text-text-subtle">/</span>}
          {c.href ? (
            <Link href={c.href} className="text-text hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="text-text-muted">{c.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
