import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  question: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, isOpen, onClose, question }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (url && isOpen) {
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then(uri => setDataUrl(uri))
        .catch(err => console.error('QR code generation failed:', err));
    }
  }, [url, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'livepoll-qr-code.png';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Scan to Vote
        </h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 px-2">
          {question}
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5 shadow-inner">
          {dataUrl ? (
            <img src={dataUrl} alt="LivePoll QR Code" className="w-48 h-48 rounded-lg" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              Generating QR Code...
            </div>
          )}
        </div>

        <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-600 truncate">
          <span className="truncate">{url}</span>
          <button
            onClick={handleCopy}
            className="text-blue-600 hover:text-blue-700 ml-auto shrink-0 font-sans font-medium flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="w-full flex gap-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};
