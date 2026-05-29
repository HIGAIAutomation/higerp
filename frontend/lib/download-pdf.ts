import { getAuthToken } from './api';

export const downloadPdf = async (docId: string, docName: string, setDownloadingDocId?: (id: string | null) => void) => {
  try {
    if (setDownloadingDocId) setDownloadingDocId(docId);
    
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/document/${docId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF on server.');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
    
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/document/render-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        htmlContent,
        filename: `${docName}.pdf`
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF on server.');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download document:', err);
    alert('Could not download PDF document. Ensure backend service is online.');
  } finally {
    if (setDownloading) setDownloading(false);
  }
};
