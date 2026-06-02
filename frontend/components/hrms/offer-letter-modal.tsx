'use client';

import { downloadPdf } from '@/lib/download-pdf';
import { fetchWithAuth } from '@/lib/api';
import { Download, Printer, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  salaryBasis: number;
  joiningDate: string;
  profDocNumber: string;
  status: string;
}

interface GeneratedDocument {
  id: string;
  templateName: string;
  htmlContent: string;
  createdAt: string;
}

interface OfferLetterModalProps {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OfferLetterModal({ employeeId, isOpen, onClose }: OfferLetterModalProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [offerLetter, setOfferLetter] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchOfferLetter();
    }
  }, [isOpen, employeeId]);

  const fetchOfferLetter = async () => {
    try {
      setLoading(true);
      
      // Fetch employee details
      const empData = await fetchWithAuth(`/hrms/employees/${employeeId}`);
      if (empData) {
        setEmployee(empData);
      }

      // Fetch offer letter
      const offerData = await fetchWithAuth(`/hrms/employees/${employeeId}/offer-letter`);
      if (offerData) {
        setOfferLetter(offerData);
      }
    } catch (error) {
      console.error('Failed to fetch offer letter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateOfferLetter = async () => {
    if (!confirm('Are you sure you want to regenerate the offer letter?')) return;

    try {
      setRegenerating(true);
      
      const response = await fetchWithAuth(`/hrms/employees/${employeeId}/regenerate-offer-letter`, {
        method: 'POST',
      });

      if (response) {
        await fetchOfferLetter();
      } else {
        throw new Error('Failed to regenerate offer letter');
      }
    } catch (error) {
      console.error('Failed to regenerate offer letter:', error);
      alert('Failed to regenerate offer letter. Please check permissions.');
    } finally {
      setRegenerating(false);
    }
  };

  const handlePrint = () => {
    if (!offerLetter) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(offerLetter.htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleDownload = async () => {
    if (!offerLetter) return;
    await downloadPdf(
      offerLetter.id,
      `${employee?.firstName}_${employee?.lastName}_Offer_Letter`,
      setDownloadingDocId
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">OFFER LETTER</h2>
            {employee && (
              <p className="text-blue-100 text-sm">
                {employee.firstName} {employee.lastName} • {employee.designation}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-b p-4 flex gap-3 flex-wrap">
          <button
            onClick={handlePrint}
            disabled={!offerLetter || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={!offerLetter || downloadingDocId === offerLetter?.id || loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" />
            {downloadingDocId === offerLetter?.id ? 'Downloading...' : 'Download PDF'}
          </button>
          <button
            onClick={handleRegenerateOfferLetter}
            disabled={regenerating || loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading offer letter...</div>
            </div>
          ) : offerLetter ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: offerLetter.htmlContent }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No offer letter generated yet</p>
              <button
                onClick={handleRegenerateOfferLetter}
                disabled={regenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {regenerating ? 'Generating...' : 'Generate Offer Letter'}
              </button>
            </div>
          )}
        </div>

        {/* Employee Details Summary */}
        {employee && !loading && (
          <div className="bg-gray-50 border-t p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Employee Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold">Full Name</p>
                <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Email</p>
                <p className="text-gray-900 text-xs break-all">{employee.email}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Designation</p>
                <p className="text-gray-900">{employee.designation}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Monthly Salary</p>
                <p className="text-gray-900 font-semibold text-blue-600">₹{Number(employee.salaryBasis || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
