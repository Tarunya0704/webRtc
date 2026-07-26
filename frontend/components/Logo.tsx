import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zoom-blue text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
            fill="currentColor"
          />
          <path d="m16 10 5-3v10l-5-3v-4Z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-semibold text-zoom-gray-900">
        Zoom<span className="text-zoom-blue">Clone</span>
      </span>
    </Link>
  );
}
