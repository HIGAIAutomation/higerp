'use client';

import { downloadPdf } from '@/lib/download-pdf';
import { fetchWithAuth } from '@/lib/api';
import { Download, Printer, RotateCcw } from 'lucide-react';
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

interface OfferLetterProps {
  employeeId: string;
  onClose?: () => void;
}

export default function OfferLetter({ employeeId, onClose }: OfferLetterProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [offerLetter, setOfferLetter] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchOfferLetter();
  }, [employeeId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading offer letter...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">OFFER LETTER</h2>
            {employee && (
              <p className="text-blue-100">
                {employee.firstName} {employee.lastName} • {employee.designation}
              </p>
            )}
          </div>
          {offerLetter && (
            <div className="text-right text-xs text-blue-100">
              Generated: {new Date(offerLetter.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 border-b p-4 flex gap-3">
        <button
          onClick={handlePrint}
          disabled={!offerLetter}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleDownload}
          disabled={!offerLetter || downloadingDocId === offerLetter?.id}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloadingDocId === offerLetter?.id ? 'Downloading...' : 'Download PDF'}
        </button>
        <button
          onClick={handleRegenerateOfferLetter}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Close
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-8">
        {offerLetter ? (
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
      {employee && (
        <div className="bg-gray-50 p-6 rounded-b-lg border-t">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Employee Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Full Name</p>
              <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Email</p>
              <p className="text-gray-900 break-all">{employee.email}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Designation</p>
              <p className="text-gray-900">{employee.designation}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Monthly Salary</p>
              <p className="text-gray-900 font-semibold text-blue-600">₹{Number(employee.salaryBasis || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Joining Date</p>
              <p className="text-gray-900">{new Date(employee.joiningDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Employee ID</p>
              <p className="text-gray-900">{employee.profDocNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Status</p>
              <p className={`font-semibold ${employee.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {employee.status?.toUpperCase() || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
