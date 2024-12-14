'use client'
import { Breadcrumb } from "@/components/breadcrumb";
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //@ts-ignore
  const poolId = children?.props.segmentPath[5][1]
  console.log(poolId)
  return (
    <>
    <Breadcrumb path={`Pools/${poolId}`} />
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          {children}
        </div>
      </section>
    </>
  );
}
