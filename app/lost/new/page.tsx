'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/src/components/layout/AppLayout';
import LostItemForm from '@/src/components/lost/LostItemForm';
import { createClient } from '@/src/lib/supabase/client';

export default function NewLostItemPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profil_pengguna')
            .select('tipe_akun, role_kampus')
            .eq('id', user.id)
            .single();

          if (profile?.tipe_akun === 'admin' || profile?.role_kampus === 'admin') {
            setIsAdmin(true);
            router.replace('/admin/laporan');
          }
        }
      } catch {
        // ignore
      }
    }
    checkRole();
  }, [router]);

  if (isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <LostItemForm />
    </AppLayout>
  );
}
