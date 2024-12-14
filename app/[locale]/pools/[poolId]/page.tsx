'use client'
export default function PoolDetail({
  params,
}: {
  params: { poolId: string; };
}) {
  return (
    <>
      <h1>

        Pool {params.poolId}
        
      </h1>
    </>
  );
}