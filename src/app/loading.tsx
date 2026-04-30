import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#f5fbfd] px-6">
      <div className="flex flex-col items-center gap-4">
        <Image
          alt="NearFix"
          className="h-20 w-20 rounded-2xl object-cover shadow-sm"
          height={80}
          priority
          src="/nearfix-logo.png"
          width={80}
        />
        <p className="text-sm font-medium tracking-normal text-[#6d737c]">
          Loading NearFix
        </p>
      </div>
    </main>
  );
}
