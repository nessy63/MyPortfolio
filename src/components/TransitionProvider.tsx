"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type TransitionCtx = {
  navigateWithWipe: (href: string) => void;
};

const Ctx = createContext<TransitionCtx>({ navigateWithWipe: () => {} });

export function useTransition() {
  return useContext(Ctx);
}

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [wiping, setWiping] = useState(false);
  const busy = useRef(false);

  const navigateWithWipe = useCallback(
    (href: string) => {
      if (busy.current) return;
      busy.current = true;
      setWiping(true);
      // Cover the screen, then swap the route while covered.
      window.setTimeout(() => {
        router.push(href);
        window.setTimeout(() => {
          setWiping(false);
          busy.current = false;
        }, 150);
      }, 420);
    },
    [router]
  );

  return (
    <Ctx.Provider value={{ navigateWithWipe }}>
      {children}

      {/* Full-viewport amber wipe — covers during route swap */}
      <AnimatePresence>
        {wiping && (
          <motion.div
            key="route-wipe"
            aria-hidden
            className="fixed inset-0 z-[80] bg-accent"
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
            animate={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1] },
            }}
            exit={{
              clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
              transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1], delay: 0.08 },
            }}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function WipeLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { navigateWithWipe } = useTransition();
  const pathname = usePathname();
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={(e: MouseEvent) => {
        if (pathname !== href) {
          e.preventDefault();
          navigateWithWipe(href);
        }
      }}
    >
      {children}
    </Link>
  );
}
