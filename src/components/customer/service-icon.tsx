type ServiceIconProps = {
  className?: string;
  slug: string;
};

const commonProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: "2.35",
  viewBox: "0 0 24 24",
};

export function ServiceIcon({ className = "h-8 w-8", slug }: ServiceIconProps) {
  if (slug === "mens-grooming" || slug === "salon-at-home") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <circle cx="6" cy="7" r="2.2" />
        <circle cx="6" cy="17" r="2.2" />
        <path d="M8 8.5 20 20" />
        <path d="M8 15.5 20 4" />
      </svg>
    );
  }

  if (slug === "spa-massage-at-home" || slug === "spa-at-home") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M20.8 8.2c0 5.2-8.8 10.6-8.8 10.6S3.2 13.4 3.2 8.2A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8.8 1.4Z" />
      </svg>
    );
  }

  if (slug === "hair-care") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M4 8h9a3 3 0 1 0-3-3" />
        <path d="M4 12h13a3 3 0 1 1-3 3" />
        <path d="M4 16h7" />
      </svg>
    );
  }

  if (slug === "skincare-advanced-treatments") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M12 21a6 6 0 0 0 6-6c0-4-6-12-6-12s-6 8-6 12a6 6 0 0 0 6 6Z" />
      </svg>
    );
  }

  if (slug === "makeup-services" || slug === "mehndi-services") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="m4 14 8-8 6 6-8 8H4Z" />
        <path d="m13 7 4 4" />
        <path d="M5 19 3 21" />
      </svg>
    );
  }

  if (slug === "house-cleaning") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="m5 14 2-2 2 2" />
        <path d="M7 12V5" />
        <path d="M12 4l1.4 3.1L16.5 8l-3.1 1.4L12 12.5l-1.4-3.1L7.5 8l3.1-1.4Z" />
        <path d="M18 13l.9 2 2.1.6-2.1.9-.9 2-.9-2-2.1-.9 2.1-.6Z" />
      </svg>
    );
  }

  if (slug === "carpenter-service") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="m14 4 6 6" />
        <path d="m12 6 6 6-2.5 2.5-6-6Z" />
        <path d="m3 21 7-7" />
      </svg>
    );
  }

  if (slug === "pest-control") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M8 7a4 4 0 0 1 8 0" />
        <path d="M7 10h10" />
        <path d="M8 10v5a4 4 0 0 0 8 0v-5" />
        <path d="M4 13h4" />
        <path d="M16 13h4" />
        <path d="m5.5 18.5 3-3" />
        <path d="m18.5 18.5-3-3" />
      </svg>
    );
  }

  if (slug === "painter-service") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="m4 14 8-8 6 6-8 8H4Z" />
        <path d="m13 7 4 4" />
      </svg>
    );
  }

  if (slug === "bike-mechanic") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <circle cx="6.5" cy="16.5" r="2.7" />
        <circle cx="17.5" cy="16.5" r="2.7" />
        <path d="m8.6 16.5 3.4-7 3 7" />
        <path d="M11.5 9.5h3" />
      </svg>
    );
  }

  if (slug === "car-mechanic") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M4 15h16l-2-5H6Z" />
        <path d="M6 15v3" />
        <path d="M18 15v3" />
        <circle cx="7" cy="18" r="1" />
        <circle cx="17" cy="18" r="1" />
      </svg>
    );
  }

  if (slug === "mobile-servicing") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <rect height="17" rx="2" width="10" x="7" y="3.5" />
        <path d="M11 18h2" />
      </svg>
    );
  }

  if (slug === "electronic-mechanic") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <rect height="14" rx="1.5" width="14" x="5" y="5" />
        <circle cx="9" cy="9" r="1" />
        <circle cx="15" cy="9" r="1" />
        <path d="m8 16 4-4 4 4" />
      </svg>
    );
  }

  if (slug === "electrician") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12c1 1 1 2 1 4h6c0-2 0-3 1-4A7 7 0 0 0 12 2Z" />
      </svg>
    );
  }

  if (slug === "ac-fridge-service") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M12 3v18" />
        <path d="m7 5 10 14" />
        <path d="M17 5 7 19" />
        <path d="M4 12h16" />
      </svg>
    );
  }

  if (slug === "ro-servicing") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M7 14c0 3 2 5 5 5s5-2 5-5" />
        <path d="M7 14c0-3 5-9 5-9s5 6 5 9" />
        <path d="M4 10c0 2 1.5 3.5 3.5 3.5" />
        <path d="M4 10c0-2 3.5-6 3.5-6" />
      </svg>
    );
  }

  if (slug === "battery-servicing") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <rect height="9" rx="1.5" width="15" x="3" y="8" />
        <path d="M21 11v3" />
      </svg>
    );
  }

  if (slug === "computer-service") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <rect height="8" rx="1" width="14" x="5" y="4" />
        <rect height="5" rx="1" width="14" x="5" y="15" />
        <path d="M8 17h.01" />
      </svg>
    );
  }

  if (
    slug === "camera-servicing" ||
    slug === "cctv-servicing" ||
    slug === "computer-training" ||
    slug === "printer-servicing" ||
    slug === "second-hand-device"
  ) {
    return <ServiceIcon className={className} slug="computer-service" />;
  }

  if (slug === "e-rickshaw-mechanic") {
    return <ServiceIcon className={className} slug="bike-mechanic" />;
  }

  if (slug === "car-bike-wash") {
    return <ServiceIcon className={className} slug="car-mechanic" />;
  }

  if (slug === "water-tank-cleaning") {
    return <ServiceIcon className={className} slug="ro-servicing" />;
  }

  if (slug === "laundry-dry-cleaning") {
    return <ServiceIcon className={className} slug="house-cleaning" />;
  }

  if (slug === "packers-movers") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M4 8h10v9H4Z" />
        <path d="M14 11h3l3 3v3h-6Z" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
      </svg>
    );
  }

  if (slug === "home-tutors") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5" />
        <path d="M8 7h8" />
        <path d="M8 11h6" />
      </svg>
    );
  }

  if (slug === "gas-stove-service") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M12 21a6 6 0 0 0 6-6c0-4-4-6-3-11-3 2-7 5-7 11a6 6 0 0 0 4 6Z" />
      </svg>
    );
  }

  if (slug === "other-services") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (slug === "plumber") {
    return (
      <svg aria-hidden="true" className={className} {...commonProps}>
        <path d="M15 5 19 9" />
        <path d="M18.5 2.5a5 5 0 0 0-6.5 6L3.5 17v3.5H7l8.5-8.5a5 5 0 0 0 6-6.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} {...commonProps}>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </svg>
  );
}
