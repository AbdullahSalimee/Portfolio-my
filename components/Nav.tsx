"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isWork = pathname === "/work";
  const isAbout = pathname === "/about";

  return (
    <nav>
      <Link href="/" className={isHome ? "active" : ""}>
        Home
      </Link>
      <Link href="/work" className={isWork ? "active" : ""}>
        Work
      </Link>
      <Link href="/about" className={isAbout ? "active" : ""}>
        About
      </Link>
    </nav>
  );
}
