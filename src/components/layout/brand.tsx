import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/dashboard"
      aria-label="DeployMe dashboard"
      className="inline-flex shrink-0 items-center"
    >
      <Image
        src="/brand/logo-text.png"
        alt="DeployMe"
        width={935}
        height={284}
        className="brand-wordmark h-auto w-28 sm:w-36"
        unoptimized
      />
    </Link>
  );
}