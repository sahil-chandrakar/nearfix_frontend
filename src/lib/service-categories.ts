export type ServiceCategory = {
  group:
    | "Personal Care"
    | "Cleaning & Handyman"
    | "Home Repairs & Maintenance"
    | "Other Services";
  label: string;
  slug: string;
};

export type PersonalCareAudience = {
  label: string;
  serviceSlugs: string[];
  slug: "male" | "female";
  title: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    group: "Personal Care",
    label: "Men's grooming",
    slug: "mens-grooming",
  },
  {
    group: "Personal Care",
    label: "Spa & massage at home",
    slug: "spa-massage-at-home",
  },
  {
    group: "Personal Care",
    label: "Salon at home",
    slug: "salon-at-home",
  },
  { group: "Personal Care", label: "Spa at home", slug: "spa-at-home" },
  {
    group: "Personal Care",
    label: "Makeup Services",
    slug: "makeup-services",
  },
  { group: "Personal Care", label: "Hair Care", slug: "hair-care" },
  {
    group: "Personal Care",
    label: "Skincare Advanced Treatments",
    slug: "skincare-advanced-treatments",
  },
  {
    group: "Personal Care",
    label: "Mehndi Services",
    slug: "mehndi-services",
  },
  { group: "Cleaning & Handyman", label: "Plumber", slug: "plumber" },
  {
    group: "Cleaning & Handyman",
    label: "House Cleaning",
    slug: "house-cleaning",
  },
  {
    group: "Cleaning & Handyman",
    label: "Carpenter Service",
    slug: "carpenter-service",
  },
  { group: "Cleaning & Handyman", label: "Pest Control", slug: "pest-control" },
  {
    group: "Cleaning & Handyman",
    label: "Painter Service",
    slug: "painter-service",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Bike Mechanic",
    slug: "bike-mechanic",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Car Mechanic",
    slug: "car-mechanic",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Mobile Servicing",
    slug: "mobile-servicing",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Electronic Mechanic",
    slug: "electronic-mechanic",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Electrician",
    slug: "electrician",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "AC/Fridge Service",
    slug: "ac-fridge-service",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "RO Servicing",
    slug: "ro-servicing",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Battery Servicing",
    slug: "battery-servicing",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Computer Service",
    slug: "computer-service",
  },
  {
    group: "Home Repairs & Maintenance",
    label: "Gas Stove Service",
    slug: "gas-stove-service",
  },
  { group: "Other Services", label: "Second Hand Device", slug: "second-hand-device" },
  { group: "Other Services", label: "Camera Servicing", slug: "camera-servicing" },
  { group: "Other Services", label: "CCTV Servicing", slug: "cctv-servicing" },
  { group: "Other Services", label: "Printer Servicing", slug: "printer-servicing" },
  {
    group: "Other Services",
    label: "E-Rickshaw Mechanic",
    slug: "e-rickshaw-mechanic",
  },
  {
    group: "Other Services",
    label: "Water Tank Cleaning",
    slug: "water-tank-cleaning",
  },
  {
    group: "Other Services",
    label: "Laundry & Dry Cleaning",
    slug: "laundry-dry-cleaning",
  },
  { group: "Other Services", label: "Packers & Movers", slug: "packers-movers" },
  { group: "Other Services", label: "Car/Bike Wash", slug: "car-bike-wash" },
  { group: "Other Services", label: "Home Tutors", slug: "home-tutors" },
  { group: "Other Services", label: "Computer Training", slug: "computer-training" },
];

export const serviceCategoryBySlug = Object.fromEntries(
  serviceCategories.map((category) => [category.slug, category]),
) as Record<string, ServiceCategory>;

export const categoryGroups = [
  "Personal Care",
  "Cleaning & Handyman",
  "Home Repairs & Maintenance",
  "Other Services",
] as const;

export const homeCategoryGroups = [
  "Cleaning & Handyman",
  "Home Repairs & Maintenance",
] as const;

export const personalCareAudiences: PersonalCareAudience[] = [
  {
    label: "Male",
    serviceSlugs: [
      "mens-grooming",
      "spa-massage-at-home",
      "makeup-services",
      "hair-care",
      "skincare-advanced-treatments",
      "mehndi-services",
    ],
    slug: "male",
    title: "Men's Services",
  },
  {
    label: "Female",
    serviceSlugs: [
      "salon-at-home",
      "spa-at-home",
      "makeup-services",
      "hair-care",
      "skincare-advanced-treatments",
      "mehndi-services",
    ],
    slug: "female",
    title: "Women's Services",
  },
];

export const personalCareAudienceBySlug = Object.fromEntries(
  personalCareAudiences.map((audience) => [audience.slug, audience]),
) as Record<PersonalCareAudience["slug"], PersonalCareAudience>;

export const personalCareServiceDescriptions: Record<string, string> = {
  "hair-care": "Hair Spa, Keratin, Coloring",
  "makeup-services": "Party, Bridal Makeup",
  "mehndi-services": "Bridal, Festive, Tattoos",
  "mens-grooming": "Haircut, shave, face cleanup",
  "salon-at-home": "Waxing, Facial, Cleanup",
  "skincare-advanced-treatments": "Advanced Facials, De-tan",
  "spa-at-home": "Body Massage, Relaxation",
  "spa-massage-at-home": "Body massage, relaxation services",
};

export const otherServiceSlugs = [
  "second-hand-device",
  "camera-servicing",
  "cctv-servicing",
  "printer-servicing",
  "e-rickshaw-mechanic",
  "water-tank-cleaning",
  "laundry-dry-cleaning",
  "packers-movers",
  "car-bike-wash",
  "home-tutors",
  "computer-training",
] as const;

export const brandServices = [
  "Samsung Service (Mobile + AC/Fridge/TV)",
  "LG / Whirlpool / IFB Service (Home Appliances)",
  "Maruti Suzuki & Hyundai Car Service",
  "Hero & Honda Bike Service",
  "Hero & Honda Bike Service",
] as const;
