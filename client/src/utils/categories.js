export const CATEGORIES = [
  { value: 'startup', label: 'Startup' },
  { value: 'side-project', label: 'Side Project' },
  { value: 'life-hack', label: 'Life Hack' },
  { value: 'tech-app', label: 'Tech/App' },
  { value: 'business', label: 'Business' },
  { value: 'creative-art', label: 'Creative/Art' },
  { value: 'other', label: 'Other' },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map(({ value, label }) => [value, label])
);
