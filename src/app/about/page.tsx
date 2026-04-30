import Link from "next/link";

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-[#edf1f3] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[430px] items-center gap-6 px-8 md:h-20 md:max-w-[820px] lg:max-w-[1040px]">
          <Link
            aria-label="Back to home"
            className="text-black transition hover:text-[#f9a21a] focus:outline-none focus:ring-2 focus:ring-[#f9a21a]"
            href="/"
          >
            <BackIcon />
          </Link>
          <h1 className="text-[28px] font-extrabold leading-none tracking-normal text-[#f9a21a] drop-shadow-[0_1px_1px_rgba(249,162,26,0.22)] md:text-[32px]">
            About
          </h1>
        </div>
      </section>

      <section className="px-4 pb-12 pt-7 sm:px-6 md:px-8 md:pb-20 md:pt-12 lg:px-10">
        <div className="mx-auto w-full max-w-[430px] md:max-w-[820px] lg:max-w-[1040px]">
          <article className="rounded-xl border border-[#e7ecef] bg-white px-6 py-7 text-center shadow-[0_2px_12px_rgba(15,23,42,0.08)] md:max-w-2xl md:px-8 md:py-9">
            <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#fff3df] text-[#f5a21a] md:h-20 md:w-20">
              <InfoIcon />
            </div>

            <h2 className="mt-5 text-[25px] font-extrabold leading-tight tracking-normal text-black md:text-[30px]">
              About NearFix
            </h2>

            <p className="mt-4 text-[16px] font-normal leading-7 tracking-normal text-[#6d737c] md:text-[18px] md:leading-8">
              NearFix helps customers find trusted local service professionals
              quickly, while giving providers a simple way to connect and grow
              their work.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
