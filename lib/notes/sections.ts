export const noteSections = ['notebook', 'training', 'project'] as const;
export type NoteSection = (typeof noteSections)[number];

export const sectionInfo = {
  notebook: { path: '/cahier', label: 'Cahier de travail' },
  training: { path: '/formations', label: 'Formations' },
  project: { path: '/projets', label: 'Projets' },
} as const;

export function isNoteSection(value: unknown): value is NoteSection {
  return typeof value === 'string' && noteSections.some((section) => section === value);
}
