import {
  Smartphone,
  Wallet,
  Briefcase,
  CreditCard,
  KeyRound,
  BookOpen,
  Package,
  Shirt,
} from 'lucide-react';

export const CATEGORIES = [
  'Semua',
  'Elektronik & Gadget',
  'Dompet & Aksesoris',
  'Pakaian & Jaket',
  'Tas & Ransel',
  'Dokumen & Kartu',
  'Kunci & Kendaraan',
  'Buku & Alat Tulis',
  'Lainnya',
] as const;

export function cleanDescription(desc?: string | null): string {
  if (!desc) return '';
  return desc.replace(/^\[Kategori:\s*[^\]]+\]\s*/i, '').trim();
}

export function detectCategory(item: {
  nama_barang?: string | null;
  deskripsi?: string | null;
  kategori?: string | null;
}): string {
  // 1. Jika ada kolom/properti kategori eksplisit
  if (item.kategori && item.kategori !== 'Barang Kampus' && item.kategori !== 'Lainnya') {
    return item.kategori;
  }

  const descRaw = item.deskripsi || '';

  // 2. Deteksi jika kategori tersimpan dalam tag deskripsi: [Kategori: ...]
  const tagMatch = descRaw.match(/\[Kategori:\s*([^\]]+)\]/i);
  if (tagMatch && tagMatch[1]) {
    const matched = tagMatch[1].trim();
    if (matched && matched !== 'Lainnya') {
      return matched;
    }
  }

  const name = (item.nama_barang || '').toLowerCase();
  const desc = descRaw.toLowerCase();

  const rules: { cat: string; regex: RegExp }[] = [
    {
      cat: 'Pakaian & Jaket',
      regex: /\b(jaket|jacket|hoodie|sweater|pakaian|baju|kaos|t-shirt|tshirt|celana|jeans|topi|sepatu|sandal|kemeja|jas|almamater|rompi|outer|cardigan|syal|jersey)\b/i,
    },
    {
      cat: 'Elektronik & Gadget',
      regex: /\b(elektronik|hp|handphone|iphone|android|laptop|ipad|macbook|headset|earphone|airpod|airpods|charger|powerbank|kamera|mouse|keyboard|gadget|tablet|tws|smartwatch)\b/i,
    },
    {
      cat: 'Dokumen & Kartu',
      regex: /\b(ktm|kartu|ktp|sim|dokumen|ijazah|sertifikat|berkas|surat|atm|id card|flazz|emoney)\b/i,
    },
    {
      cat: 'Kunci & Kendaraan',
      regex: /\b(kunci|motor|helm|mobil|sepeda|kendaraan|remote|stnk)\b/i,
    },
    {
      cat: 'Dompet & Aksesoris',
      regex: /\b(dompet|wallet|uang|duit|perhiasan|cincin|kalung|gelang|kacamata|aksesoris|jam tangan)\b/i,
    },
    {
      cat: 'Tas & Ransel',
      regex: /\b(tas|ransel|backpack|totebag|tote bag|pouch|koper|slingbag|sling bag)\b/i,
    },
    {
      cat: 'Buku & Alat Tulis',
      regex: /\b(buku|catatan|tulis|skripsi|binder|pulpen|pensil|makalah|modul|kamus)\b/i,
    },
  ];

  for (const r of rules) {
    if (r.regex.test(name)) return r.cat;
  }
  for (const r of rules) {
    if (r.regex.test(desc)) return r.cat;
  }
  return 'Lainnya';
}

export function getCategoryIcon(cat: string) {
  const lower = (cat || '').toLowerCase();
  if (
    lower.includes('pakaian') ||
    lower.includes('jaket') ||
    lower.includes('jacket') ||
    lower.includes('baju') ||
    lower.includes('hoodie') ||
    lower.includes('sweater')
  ) {
    return Shirt;
  }
  if (
    lower.includes('elektronik') ||
    lower.includes('hp') ||
    lower.includes('gadget') ||
    lower.includes('laptop')
  ) {
    return Smartphone;
  }
  if (lower.includes('dompet') || lower.includes('aksesoris')) {
    return Wallet;
  }
  if (lower.includes('tas') || lower.includes('ransel')) {
    return Briefcase;
  }
  if (lower.includes('dokumen') || lower.includes('kartu') || lower.includes('ktm')) {
    return CreditCard;
  }
  if (lower.includes('kunci') || lower.includes('kendaraan') || lower.includes('motor')) {
    return KeyRound;
  }
  if (lower.includes('buku') || lower.includes('tulis')) {
    return BookOpen;
  }
  return Package;
}
