'use client'
export default function BossDetail({
  params,
}: {
  params: { bossId: string; };
}) {
  return (
    <>
      <h1>

        Boss {params.bossId}
        
      </h1>
    </>
  );
}