import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookByIdPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;

  const query = new URLSearchParams();
  if (id) {
    query.set("vehicle", id);
  }
  for (const [key, val] of Object.entries(sParams)) {
    if (key !== "vehicle" && typeof val === "string") {
      query.set(key, val);
    }
  }

  redirect(`/book?${query.toString()}`);
}
