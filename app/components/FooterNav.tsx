'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Archive, Bookmark, Calendar, Newspaper, UserRound } from 'lucide-react';

type Tab = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const TABS: Tab[] = [
  { href: '/choice_magazine', label: 'マガジン', Icon: Newspaper},
  { href: '/diary_archive', label: 'アーカイブ', Icon:Archive },
{ href: '.', label: 'カレンダー', Icon: Calendar },
  
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="フッターナビゲーション"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
    >
      <div className="mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={[
                'relative flex h-16 flex-col items-center justify-center gap-1',
                'select-none',
                active ? 'text-red-600' : 'text-neutral-500',
              ].join(' ')}
            >
              {/* Active indicator (top pill) */}
              <span
                className={[
                  'absolute top-1 h-1 w-10 rounded-full transition-opacity',
                  active ? 'opacity-100 bg-red-600' : 'opacity-0 bg-transparent',
                ].join(' ')}
              />

              <Icon className={['h-5 w-5', active ? 'opacity-100' : 'opacity-80'].join(' ')} />

              <span className={['text-[11px] leading-none', active ? 'font-medium' : 'font-normal'].join(' ')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
