import type { ApiServiceCategory } from "@/types/auth";
import type { Language } from "@/lib/i18n";
import {
  groupHindiLabels,
  type ServiceCategory,
  serviceHindiLabels,
} from "@/lib/service-categories";

type CategoryLike = ApiServiceCategory | ServiceCategory | {
  group: string;
  groupHi?: string;
  label: string;
  labelHi?: string;
  slug: string;
};

export function categoryLabel(category: CategoryLike, language: Language) {
  if (language === "hi") {
    return category.labelHi || serviceHindiLabels[category.slug] || category.label;
  }
  return category.label;
}

export function categoryGroupLabel(group: string, language: Language, groupHi?: string) {
  if (language === "hi") {
    return groupHi || groupHindiLabels[group] || group;
  }
  return group;
}

export function categoryLabelBySlug(slug: string, fallback: string, language: Language) {
  if (language === "hi") {
    return serviceHindiLabels[slug] || fallback;
  }
  return fallback;
}
