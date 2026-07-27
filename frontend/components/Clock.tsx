"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    // Avoid an SSR/client markup mismatch — render nothing until mounted client-side.
    return <div className="h-[76px]" />;
  }

  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="text-center">
      <p className="text-4xl font-bold tracking-tight text-zoom-gray-900 sm:text-5xl">{time}</p>
      <p className="mt-1 text-sm text-zoom-gray-600">{date}</p>
    </div>
  );
}
