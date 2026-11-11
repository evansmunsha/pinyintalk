import Image from "next/image";

export function UserAvatar({
  name,
  imageUrl,
  size = 40,
}: {
  name: string;
  imageUrl: string | null;
  size?: number;
}) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 font-semibold text-teal-800"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={size}
          height={size}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        name.trim().charAt(0).toUpperCase() || "?"
      )}
    </span>
  );
}
