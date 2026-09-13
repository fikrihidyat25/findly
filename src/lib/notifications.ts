import { createClient } from './supabase/client';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  timeAgo: string;
  timestamp: number;
  type: 'claim' | 'found' | 'chat' | 'system' | 'resolved';
  unread: boolean;
  link: string;
  counterpartName?: string;
  itemTitle?: string;
}

function formatRelativeTime(dateString: string) {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}j lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}h lalu`;
  } catch {
    return 'Baru saja';
  }
}

export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = createClient();
  const notifs: AppNotification[] = [];

  try {
    const readIds: string[] = JSON.parse(
      typeof window !== 'undefined'
        ? localStorage.getItem(`findly_read_notifs_${userId}`) || '[]'
        : '[]'
    );

    // 1. Laporan yang dibuat oleh user saat ini
    const { data: myReports } = await supabase
      .from('laporan_barang')
      .select('id, nama_barang, jenis_laporan')
      .eq('pelapor_id', userId);

    if (myReports && myReports.length > 0) {
      const reportIds = myReports.map((r) => r.id);

      // Klaim / konfirmasi masuk dari pengguna lain terhadap laporan saya
      const { data: incomingClaims } = await supabase
        .from('klaim_barang')
        .select('*, laporan_barang(nama_barang, jenis_laporan), profil_pengguna:pengklaim_id(nama_lengkap, role_kampus)')
        .in('laporan_id', reportIds)
        .order('dibuat_pada', { ascending: false });

      (incomingClaims || []).forEach((c: any) => {
        const report = c.laporan_barang;
        const isFoundReport = report?.jenis_laporan === 'DITEMUKAN';
        const actorName = c.profil_pengguna?.nama_lengkap || 'Pengguna Lain';
        const itemTitle = report?.nama_barang || 'Barang';
        const notifId = `claim-in-${c.id}`;
        const createdMs = c.dibuat_pada ? new Date(c.dibuat_pada).getTime() : Date.now();

        if (isFoundReport) {
          // Ada yang mengklaim barang temuan saya
          notifs.push({
            id: notifId,
            title: 'Pengajuan Klaim Masuk',
            desc: `${actorName} mengajukan klaim atas barang temuan Anda "${itemTitle}". Segera periksa dan lakukan verifikasi.`,
            timeAgo: formatRelativeTime(c.dibuat_pada),
            timestamp: createdMs,
            type: 'claim',
            unread: !readIds.includes(notifId),
            link: `/messages?id=${c.id}`,
            counterpartName: actorName,
            itemTitle,
          });
        } else {
          // Ada yang mengonfirmasi menemukan barang hilang saya
          notifs.push({
            id: notifId,
            title: 'Kabar Baik: Barang Anda Ditemukan!',
            desc: `${actorName} mengonfirmasi telah menemukan barang hilang Anda "${itemTitle}". Buka ruang pesan untuk koordinasi.`,
            timeAgo: formatRelativeTime(c.dibuat_pada),
            timestamp: createdMs,
            type: 'found',
            unread: !readIds.includes(notifId),
            link: `/messages?id=${c.id}`,
            counterpartName: actorName,
            itemTitle,
          });
        }
      });
    }

    // 2. Status klaim yang pernah diajukan oleh user ini (sebagai pengaju klaim)
    const { data: myOutgoingClaims } = await supabase
      .from('klaim_barang')
      .select('*, laporan_barang(nama_barang)')
      .eq('pengklaim_id', userId)
      .order('dibuat_pada', { ascending: false });

    (myOutgoingClaims || []).forEach((c: any) => {
      const itemTitle = c.laporan_barang?.nama_barang || 'Barang';
      const notifId = `claim-out-${c.id}-${c.status}`;
      const createdMs = c.dibuat_pada ? new Date(c.dibuat_pada).getTime() : Date.now();

      if (c.status === 'SELESAI') {
        notifs.push({
          id: notifId,
          title: 'Klaim Berhasil Disepakati',
          desc: `Klaim verifikasi barang "${itemTitle}" telah berstatus SELESAI dan diserahterimakan.`,
          timeAgo: formatRelativeTime(c.dibuat_pada),
          timestamp: createdMs,
          type: 'resolved',
          unread: !readIds.includes(notifId),
          link: `/messages?id=${c.id}`,
          itemTitle,
        });
      } else if (c.status === 'DITOLAK') {
        notifs.push({
          id: notifId,
          title: 'Klaim Ditolak / Dalam Mediasi',
          desc: `Klaim untuk barang "${itemTitle}" tidak disetujui atau memerlukan mediasi admin.`,
          timeAgo: formatRelativeTime(c.dibuat_pada),
          timestamp: createdMs,
          type: 'claim',
          unread: !readIds.includes(notifId),
          link: `/messages?id=${c.id}`,
          itemTitle,
        });
      }
    });

    // 3. Pesan terbaru yang dikirim oleh lawan bicara di ruang chat
    const allClaimIds = [
      ...notifs.map((n) => n.link.split('id=')[1]).filter(Boolean),
      ...(myOutgoingClaims || []).map((c) => c.id),
    ];
    const uniqueClaimIds = Array.from(new Set(allClaimIds));

    if (uniqueClaimIds.length > 0) {
      const { data: recentMessages } = await supabase
        .from('pesan_chat')
        .select('*, klaim_barang(laporan_barang(nama_barang))')
        .in('klaim_id', uniqueClaimIds)
        .neq('pengirim_id', userId)
        .order('dibuat_pada', { ascending: false })
        .limit(50);

      const messagesByClaim: Record<string, any[]> = {};
      (recentMessages || []).forEach((m: any) => {
        if (!messagesByClaim[m.klaim_id]) {
          messagesByClaim[m.klaim_id] = [];
        }
        messagesByClaim[m.klaim_id].push(m);
      });

      Object.entries(messagesByClaim).forEach(([klaimId, msgs]) => {
        const latestMessage = msgs[0];
        const notifId = `msg-group-${klaimId}-${latestMessage.id}`;
        
        let unreadCount = 0;
        for (const m of msgs) {
          const legacyId = `msg-${m.id}`;
          const groupId = `msg-group-${klaimId}-${m.id}`;
          if (!readIds.includes(legacyId) && !readIds.includes(groupId)) {
            unreadCount++;
          } else {
            break;
          }
        }

        const isUnread = !readIds.includes(notifId) && unreadCount > 0;

        const createdMs = new Date(latestMessage.dibuat_pada).getTime();
        let snippet = latestMessage.pesan;
        try {
          const parsed = JSON.parse(latestMessage.pesan);
          snippet = parsed.text || (parsed.imageUrl ? '📷 Mengirim foto verifikasi' : 'Pesan baru');
        } catch {
          // regular text
        }
        if (snippet.length > 60) snippet = snippet.substring(0, 60) + '...';

        const itemName = latestMessage.klaim_barang?.laporan_barang?.nama_barang;
        let title = 'Pesan Verifikasi Baru';
        if (itemName) {
          title = unreadCount > 1 
            ? `${unreadCount} Pesan Baru: ${itemName}`
            : `Pesan Baru: ${itemName}`;
        } else {
          title = unreadCount > 1 
            ? `${unreadCount} Pesan Verifikasi Baru`
            : 'Pesan Verifikasi Baru';
        }

        notifs.push({
          id: notifId,
          title,
          desc: snippet,
          timeAgo: formatRelativeTime(latestMessage.dibuat_pada),
          timestamp: createdMs,
          type: 'chat',
          unread: isUnread,
          link: `/messages?id=${klaimId}`,
          itemTitle: itemName || 'Barang',
        });
      });
    }

    // 4. Jika user adalah Admin, muat notifikasi moderasi laporan & klaim kampus
    const isEnvAdmin =
      typeof document !== 'undefined' && document.cookie.includes('findly_admin_session=true');
    const { data: profile } = await supabase
      .from('profil_pengguna')
      .select('tipe_akun, role_kampus')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin =
      isEnvAdmin ||
      profile?.tipe_akun === 'admin' ||
      profile?.role_kampus === 'admin' ||
      userId === 'admin-env-user';

    if (isAdmin) {
      // a. Klaim yang menunggu verifikasi
      const { data: adminClaims } = await supabase
        .from('klaim_barang')
        .select('*, laporan_barang(nama_barang), profil_pengguna:pengklaim_id(nama_lengkap)')
        .eq('status', 'MENUNGGU')
        .order('dibuat_pada', { ascending: false })
        .limit(10);

      (adminClaims || []).forEach((ac: any) => {
        const notifId = `admin-claim-${ac.id}`;
        const itemTitle = ac.laporan_barang?.nama_barang || 'Barang';
        const claimantName = ac.profil_pengguna?.nama_lengkap || 'Warga Kampus';
        const createdMs = ac.dibuat_pada ? new Date(ac.dibuat_pada).getTime() : Date.now();

        notifs.push({
          id: notifId,
          title: 'Klaim Menunggu Verifikasi',
          desc: `${claimantName} mengajukan klaim untuk "${itemTitle}". Memerlukan peninjauan administrator.`,
          timeAgo: formatRelativeTime(ac.dibuat_pada),
          timestamp: createdMs,
          type: 'claim',
          unread: !readIds.includes(notifId),
          link: `/admin/klaim`,
          itemTitle,
        });
      });

      // b. Laporan baru yang baru saja masuk
      const { data: adminReports } = await supabase
        .from('laporan_barang')
        .select('id, nama_barang, jenis_laporan, dibuat_pada')
        .order('dibuat_pada', { ascending: false })
        .limit(10);

      (adminReports || []).forEach((ar: any) => {
        const notifId = `admin-rep-${ar.id}`;
        const createdMs = ar.dibuat_pada ? new Date(ar.dibuat_pada).getTime() : Date.now();

        notifs.push({
          id: notifId,
          title: ar.jenis_laporan === 'KEHILANGAN' ? 'Laporan Kehilangan Baru' : 'Laporan Temuan Baru',
          desc: `Laporan ${ar.jenis_laporan.toLowerCase()} baru: "${ar.nama_barang}". Periksa moderasi laporan.`,
          timeAgo: formatRelativeTime(ar.dibuat_pada),
          timestamp: createdMs,
          type: 'system',
          unread: !readIds.includes(notifId),
          link: `/admin/laporan`,
          itemTitle: ar.nama_barang,
        });
      });
    }

    // Sort descending by timestamp
    notifs.sort((a, b) => b.timestamp - a.timestamp);

    // If still empty, add initial friendly system notification
    if (notifs.length === 0) {
      notifs.push({
        id: 'sys-welcome',
        title: 'Selamat Datang di Findly',
        desc: 'Akun Anda aktif. Notifikasi klaim barang dan pesan verifikasi kampus akan muncul otomatis di sini.',
        timeAgo: 'Baru saja',
        timestamp: Date.now(),
        type: 'system',
        unread: false,
        link: '/find',
      });
    }
  } catch (err) {
    console.error('Error fetching user notifications:', err);
  }

  return notifs;
}

export function markNotificationAsRead(userId: string, notifId: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = `findly_read_notifs_${userId}`;
    const current: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!current.includes(notifId)) {
      current.push(notifId);
      localStorage.setItem(key, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}

export function markAllNotificationsAsRead(userId: string, notifIds: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const key = `findly_read_notifs_${userId}`;
    const current: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    const merged = Array.from(new Set([...current, ...notifIds]));
    localStorage.setItem(key, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export async function fetchUnreadCounts(userId: string): Promise<{ unreadNotifs: number; unreadMessages: number }> {
  try {
    const notifs = await fetchUserNotifications(userId);
    const unreadNotifs = notifs.filter((n) => n.unread && n.type !== 'chat').length;
    const unreadMessages = notifs.filter((n) => n.unread && n.type === 'chat').length;
    return { unreadNotifs, unreadMessages };
  } catch {
    return { unreadNotifs: 0, unreadMessages: 0 };
  }
}
