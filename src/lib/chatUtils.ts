export function compressImage(file: File, maxWidth = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function parseChatMessage(rawText: string): { text: string; imageUrl?: string } {
  if (!rawText) return { text: '' };

  if (rawText.startsWith('{') && rawText.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object') {
        return {
          text: typeof parsed.text === 'string' ? parsed.text : '',
          imageUrl: typeof parsed.imageUrl === 'string' ? parsed.imageUrl : undefined,
        };
      }
    } catch {
      // ignore
    }
  }

  if (rawText.includes('[GAMBAR]:')) {
    const parts = rawText.split('[GAMBAR]:');
    return {
      text: parts[0].trim(),
      imageUrl: parts[1].trim(),
    };
  }

  if (rawText.startsWith('data:image/') || rawText.startsWith('blob:')) {
    return { text: '', imageUrl: rawText };
  }

  return { text: rawText };
}

export function getCurrentTime(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
