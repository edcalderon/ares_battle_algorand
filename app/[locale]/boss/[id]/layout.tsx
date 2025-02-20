'use client'
import { Breadcrumb } from "@/components/breadcrumb";
export default function BossLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //@ts-ignore
  const id = children?.props.segmentPath[5][1]
  console.log(id)
  return (
    <>
    <Breadcrumb path={`Boss/${id}`} />
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          {children}
        </div>
      </section>
    </>
  );
}
