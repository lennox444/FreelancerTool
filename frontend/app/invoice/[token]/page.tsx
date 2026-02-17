import { Suspense } from 'react';
import ClientPortalContent from './ClientPortalContent';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ClientPortalPage({ params }: Props) {
  const { token } = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ClientPortalContent token={token} />
    </Suspense>
  );
}
