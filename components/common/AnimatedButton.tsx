import Link from "next/link";

interface AnimatedButtonProps {
  href: string;
  label: string;
  className?: string;
}

export default function AnimatedButton({
  href,
  label,
  className = "",
}: AnimatedButtonProps) {
  return (
    <Link
      href={href}
      className={`group btn-framer-primary text-md px-2 pl-4 py-2 ${className}`}
    >
      {label}

      <span className="ml-2 relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white text-black">
        {/* Current Arrow */}
        <svg
          className="absolute h-3.5 w-3.5 transition-all duration-300 ease-out group-hover:-translate-y-6 group-hover:translate-x-6"
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" />
        </svg>

        {/* New Arrow */}
        <svg
          className="absolute h-3.5 w-3.5 -translate-x-6 translate-y-6 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0"
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" />
        </svg>
      </span>
    </Link>
  );
}