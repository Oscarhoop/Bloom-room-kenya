import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-16 w-auto",
    md: "h-20 w-auto", 
    lg: "h-24 w-auto"
  };

  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label="Bloom Room Kenya — Home">
      <Image
        src="/logo.png"
        alt="Bloom Room Kenya"
        className={`${sizeClasses[size]} object-contain bg-transparent`}
        width={240}
        height={80}
        priority
        style={{ backgroundColor: 'transparent' }}
      />
    </Link>
  );
}
