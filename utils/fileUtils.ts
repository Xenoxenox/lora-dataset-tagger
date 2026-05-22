
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Vision APIs expect the raw payload; callers pass MIME type separately.
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

export const downloadBlobFile = (blob: Blob, filename: string) => {
  // Anchor-click download keeps exports client-only; no dataset data leaves the browser.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadTextFile = (content: string, filename: string) => {
  downloadBlobFile(new Blob([content], { type: 'text/plain' }), filename);
};
