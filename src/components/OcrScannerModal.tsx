import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressFieldImage } from '../utils/imageCompressor';
import { scanKtpOnDevice, scanC1OnDevice, OcrKtpResult, OcrC1Result } from '../utils/onDeviceOcr';
import { validateNikWithDapilGuard, DapilConfig } from '../utils/dapilGuard';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: Record<string, any>, imageFile: File) => void;
  mode: 'ktp' | 'c1';
  dapilConfig?: DapilConfig;
  allowGallery?: boolean;
}

export function OcrScannerModal({ isOpen, onClose, onScanComplete, mode, dapilConfig, allowGallery = true }: OcrScannerModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setIsProcessing(false);
    setProgress(0);
    setStatusText('');
    setError('');
    setPreviewUrl(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processImage = useCallback(async (file: File) => {
    try {
      resetState();
      setIsProcessing(true);
      setStatusText('Memproses dan menajamkan foto...');
      
      const compressed = await compressFieldImage(file, { maxDimension: 1600, applySharpening: true });
      setPreviewUrl(compressed.dataUrl);

      if (mode === 'ktp') {
        const ocrResult: OcrKtpResult = await scanKtpOnDevice(compressed.file, (pct, status) => {
          setProgress(pct);
          setStatusText(status);
        });
        
        if (!ocrResult.nik) {
          throw new Error('NIK tidak terdeteksi. Harap foto KTP dengan lebih jelas, hindari pantulan cahaya.');
        }

        const validation = validateNikWithDapilGuard(ocrResult.nik, dapilConfig);
        if (!validation.isValid) {
          throw new Error(validation.rejectReason || 'Data NIK tidak valid atau di luar dapil.');
        }

        // Return extracted data mapping to form schema keys
        onScanComplete({
          nik: validation.nikCleaned,
          name: ocrResult.nama || '',
          gender: validation.parsedData?.gender || ocrResult.jenisKelamin || 'Laki-laki',
          kecamatan: validation.parsedData?.kecamatanName || ocrResult.kecamatan || ''
        }, compressed.file);
        
      } else {
        // C1 Plano
        const ocrResult: OcrC1Result = await scanC1OnDevice(compressed.file, (pct, status) => {
          setProgress(pct);
          setStatusText(status);
        });

        if (!ocrResult.isArithmeticValid) {
          throw new Error('Aritmatika C1 tidak valid: ' + ocrResult.arithmeticNotes.join(' '));
        }

        onScanComplete({
          suara_caleg: ocrResult.suaraCaleg,
          suara_partai: ocrResult.suaraPartai,
          suara_tidak_sah: ocrResult.suaraTidakSah
        }, compressed.file);
      }
      
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses gambar.');
      setIsProcessing(false);
    }
  }, [mode, dapilConfig, onScanComplete]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            {mode === 'ktp' ? 'Scan KTP Otomatis' : 'Scan C1 Plano'}
          </h3>
          <button onClick={handleClose} disabled={isProcessing} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {isProcessing ? (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-slate-100 border-2 border-indigo-500 shadow-inner">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
              </div>
              <div className="w-full max-w-xs space-y-2 text-center">
                <div className="text-sm font-semibold text-slate-700">{statusText}</div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="w-full text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <X className="w-8 h-8" />
              </div>
              <div className="text-sm font-medium text-rose-600 px-4">{error}</div>
              <button 
                onClick={() => setError('')} 
                className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Camera className="w-5 h-5" />
                Buka Kamera
              </button>
              
              {allowGallery && (
                <>
                  <div className="text-center text-xs text-slate-500 font-medium">Atau</div>
                  <button 
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute('capture');
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full py-3 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Pilih dari Galeri
                  </button>
                </>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-[11px] rounded-lg border border-blue-100 leading-relaxed">
                <strong>Tips:</strong> Pastikan {mode === 'ktp' ? 'KTP' : 'C1 Plano'} difoto dengan pencahayaan cukup, tidak berbayang, dan teks terbaca jelas agar AI dapat mengekstrak data dengan akurat.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
