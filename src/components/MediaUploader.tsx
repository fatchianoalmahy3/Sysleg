import React, { useState, useRef } from 'react';
import { Upload, File, Image as ImageIcon, X, CheckCircle, Zap } from 'lucide-react';
import { ApiService } from '../services/api';
import { compressFieldImage } from '../utils/imageCompressor';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label: string;
}

export function MediaUploader({ value, onChange, placeholder, label }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ original: string; compressed: string; ratio: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setCompressionInfo(null);

    try {
      let finalFile = file;
      let dataUrlToUpload = '';

      if (file.type.startsWith('image/')) {
        try {
          const comp = await compressFieldImage(file, { applySharpening: true });
          finalFile = comp.file;
          dataUrlToUpload = comp.dataUrl;
          
          const origKb = (comp.originalSize / 1024).toFixed(0);
          const compKb = (comp.compressedSize / 1024).toFixed(0);
          setCompressionInfo({
            original: `${origKb} KB`,
            compressed: `${compKb} KB`,
            ratio: comp.compressionRatio
          });
        } catch (compErr) {
          console.warn('Compress error, fallback to raw image:', compErr);
        }
      }

      if (dataUrlToUpload) {
        const uploadedUrl = await ApiService.uploadFile(finalFile.name, finalFile.type, dataUrlToUpload);
        onChange(uploadedUrl);
        setIsUploading(false);
      } else {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            const uploadedUrl = await ApiService.uploadFile(finalFile.name, finalFile.type, base64String);
            onChange(uploadedUrl);
          } catch (err: any) {
            setError(err.message || 'Gagal mengunggah berkas.');
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(finalFile);
      }
    } catch {
      setError('Gagal membaca berkas.');
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/50' 
            : value 
              ? 'border-emerald-300 bg-emerald-50/20' 
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,application/pdf"
        />

        {isUploading ? (
          <div className="py-4 space-y-2">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Sedang mengunggah berkas...</p>
          </div>
        ) : value ? (
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              {value.startsWith('data:image') || value.includes('unsplash.com') ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <File className="w-6 h-6" />
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">Berkas Berhasil Terunggah</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> READY
                  </span>
                  {compressionInfo && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>{compressionInfo.compressed} ({compressionInfo.ratio}% Hemat)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-indigo-600 hover:underline">Klik untuk mengunggah</span> atau seret berkas ke sini
            </div>
            <p className="text-[10px] text-slate-400">{placeholder || 'Mendukung format PNG, JPG, atau PDF up to 10MB'}</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
