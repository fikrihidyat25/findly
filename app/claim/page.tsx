'use client';

import { Suspense } from 'react';
import AppLayout from '@/src/components/layout/AppLayout';
import ClaimSubmissionForm from '@/src/components/claim/ClaimSubmissionForm';

export default function ClaimPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat formulir klaim...</div>}>
        <ClaimSubmissionForm />
      </Suspense>
    </AppLayout>
  );
}
