import NotesSectionPage from "@/app/components/notes-section-page";

export default function Page({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <NotesSectionPage section="training" searchParams={searchParams} />;
}
