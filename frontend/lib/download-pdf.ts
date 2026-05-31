import { getAuthToken } from './api';

export const downloadPdf = async (docId: string, docName: string, setDownloadingDocId?: (id: string | null) => void) => {
  try {
    if (setDownloadingDocId) setDownloadingDocId(docId);
    
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Fetch raw compiled HTML layout from the backend
    const response = await fetch(`${apiUrl}/document/${docId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch document layout: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    const htmlContent = await response.text();
    
    // Render PDF dynamically client-side
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    await html2pdf().set({
      margin: [15, 15, 15, 15],
      filename: `${docName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    } as any).from(container).save();
    
    document.body.removeChild(container);
  } catch (err) {
    console.error('Failed to download document:', err);
    alert('Could not download PDF document. Ensure backend service is online.');
  } finally {
    if (setDownloadingDocId) setDownloadingDocId(null);
  }
};

export const downloadPdfFromHtml = async (htmlContent: string, docName: string, setDownloading?: (status: boolean) => void) => {
  try {
    if (setDownloading) setDownloading(true);
    
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    await html2pdf().set({
      margin: [15, 15, 15, 15],
      filename: `${docName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    } as any).from(container).save();
    
    document.body.removeChild(container);
  } catch (err) {
    console.error('Failed to download document:', err);
    alert('Could not download PDF document.');
  } finally {
    if (setDownloading) setDownloading(false);
  }
};
