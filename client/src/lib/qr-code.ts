import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 200,
      height: 200,
      margin: 2,
      color: {
        dark: '#2563EB',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw error;
  }
}

export function downloadQRCode(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
