'use client';

import React, { useState, useRef } from 'react';
import { X, PenTool, UploadCloud, Save, Loader2, ChevronLeft, ChevronRight, Undo2, CheckCircle2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  compiledHtml: string | null;
  onSign: (signatureData: string, applyToAll: boolean) => Promise<void>;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  status?: string;
  onUnsign?: (applyToAll: boolean) => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentId,
  documentName,
  compiledHtml,
  onSign,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  status,
  onUnsign
}: DocumentPreviewModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [signMode, setSignMode] = useState<'draw' | 'upload'>('draw');
  const [isSaving, setIsSaving] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  if (!isOpen) return null;

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleUndo = () => {
    if (sigCanvas.current) {
      // @ts-ignore
      const data = sigCanvas.current.toData();
      if (data && data.length > 0) {
        data.pop();
        // @ts-ignore
        sigCanvas.current.fromData(data);
      }
    }
  };

  const handleSaveSignature = async () => {
    if (signMode === 'draw') {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        setIsSaving(true);
        try {
          await onSign(dataUrl, applyToAll);
          setIsSigning(false);
        } catch (error) {
          console.error('Error signing document:', error);
        } finally {
          setIsSaving(false);
        }
      } else {
        alert('Please draw a signature first.');
      }
    } else {
      // File upload mode logic to be handled via file input onChange
      alert('File upload selected. Please upload an image.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setIsSaving(true);
        try {
          await onSign(dataUrl, applyToAll);
          setIsSigning(false);
        } catch (error) {
          console.error('Error signing document:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-card w-[98vw] h-[98vh] max-w-none rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Preview: <span className="text-accent">{documentName}</span>
            </h2>
            {(hasNext !== undefined || hasPrev !== undefined) && (
              <div className="flex items-center gap-1 ml-4 border-l border-border pl-4">
                <button 
                  onClick={onPrev} 
                  disabled={!hasPrev}
                  className="p-1.5 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={onNext} 
                  disabled={!hasNext}
                  className="p-1.5 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content area: Document Preview + E-Sign Panel */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Document Iframe Viewer */}
          <div className="flex-1 bg-white overflow-hidden flex flex-col relative border-r border-border min-h-[400px]">
            {compiledHtml ? (
              <iframe
                srcDoc={compiledHtml}
                title="Document Preview"
                className="w-full h-full border-none"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading document content...
              </div>
            )}
          </div>

          {/* E-Sign Panel */}
          <div className={`w-full md:w-80 bg-muted/10 p-6 flex flex-col transition-all duration-300 overflow-y-auto ${(status === 'signed' || !isSigning) ? 'justify-center' : 'justify-start'}`}>
            {status === 'signed' ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-4 bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Document Signed</h3>
                <p className="text-sm text-muted-foreground mb-6 font-semibold">
                  This document has already been digitally signed and finalized.
                </p>
                {onUnsign && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onUnsign(false)}
                      className="w-full bg-rose-500/10 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      Remove Signature
                    </button>
                    <button
                      onClick={() => onUnsign(true)}
                      className="w-full bg-transparent border border-rose-500/30 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-500/10 transition-all text-sm"
                    >
                      Remove from All Documents
                    </button>
                  </div>
                )}
              </div>
            ) : !isSigning ? (
              <div className="text-center">
                <div className="mb-4 bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-accent">
                  <PenTool className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">E-Sign Document</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Preview looks good? You can digitally sign this document to finalize it.
                </p>
                <button
                  onClick={() => setIsSigning(true)}
                  className="w-full bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all"
                >
                  Start Signing
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5">
                    <PenTool className="h-4 w-4 text-accent" />
                    Sign Document
                  </h3>
                  <button onClick={() => setIsSigning(false)} className="text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>

                <div className="flex gap-2 mb-4 p-1 bg-secondary rounded-lg">
                  <button 
                    onClick={() => setSignMode('draw')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${signMode === 'draw' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Draw
                  </button>
                  <button 
                    onClick={() => setSignMode('upload')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${signMode === 'upload' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Upload
                  </button>
                </div>

                {signMode === 'draw' ? (
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="border-2 border-dashed border-border rounded-xl bg-white overflow-hidden h-[140px]">
                      <SignatureCanvas 
                        ref={sigCanvas}
                        canvasProps={{ className: 'w-full h-full' }}
                        minWidth={0.8}
                        maxWidth={2.2}
                        backgroundColor="white"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <button 
                        onClick={handleUndo}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Undo2 className="h-3 w-3" />
                        Undo Stroke
                      </button>
                      <button 
                        onClick={handleClear}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear Canvas
                      </button>
                    </div>
                    
                    <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm font-semibold">
                      <input type="checkbox" checked={applyToAll} onChange={e => setApplyToAll(e.target.checked)} className="rounded border-gray-300 text-accent focus:ring-accent w-4 h-4" />
                      Apply to all project documents
                    </label>

                    <button
                      onClick={handleSaveSignature}
                      disabled={isSaving}
                      className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? 'Applying...' : 'Apply Signature'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 justify-center">
                    <label className="border-2 border-dashed border-accent/50 bg-accent/5 hover:bg-accent/10 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center">
                      <UploadCloud className="h-10 w-10 text-accent mb-3" />
                      <span className="text-sm font-semibold text-foreground mb-1">Click to upload signature</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </label>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer text-sm font-semibold justify-center">
                      <input type="checkbox" checked={applyToAll} onChange={e => setApplyToAll(e.target.checked)} className="rounded border-gray-300 text-accent focus:ring-accent w-4 h-4" />
                      Apply to all project documents
                    </label>
                  </div>
                )}
                
                <p className="text-[10px] text-muted-foreground text-center mt-6">
                  By applying your signature, you agree to the terms specified in this document. The signature will be permanently attached.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
