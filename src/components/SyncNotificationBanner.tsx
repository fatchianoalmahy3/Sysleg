import React, { useState, useEffect } from 'react';
import { CloudAlert, RefreshCw, CheckCircle2, WifiOff, ArrowRight } from 'lucide-react';
import { transientQueue } from '../utils/transientQueue';

interface SyncNotificationBannerProps {
  onSyncSuccess?: () => void;
  onShowToast?: (message: string, type: 'success' | 'warning' | 'error' | 'info', title?: string) => void;
}

export function SyncNotificationBanner({
  onSyncSuccess,
  onShowToast,
}: SyncNotificationBannerProps) {
  const [pendingCount, setPendingCount] = useState<number>(() => transientQueue.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const unsubscribe = transientQueue.subscribe((count) => {
      setPendingCount(count);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || pendingCount === 0) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (onShowToast) {
        onShowToast(
          'Perangkat masih dalam keadaan offline. Harap sambungkan ke internet untuk melakukan sinkronisasi.',
          'warning',
          'Koneksi Offline'
        );
      }
      return;
    }

    setIsSyncing(true);
    try {
      const syncedCount = await transientQueue.flushQueue();
      if (syncedCount > 0) {
        if (onShowToast) {
          onShowToast(
            `Sebanyak ${syncedCount} data lokal berhasil diverifikasi dan disinkronkan ke Cloud Database!`,
            'success',
            'Sinkronisasi Sukses'
          );
        }
        if (onSyncSuccess) {
          onSyncSuccess();
        }
      } else {
        if (onShowToast) {
          onShowToast(
            'Gagal menyinkronkan data. Server database belum dapat dijangkau. Coba beberapa saat lagi.',
            'error',
            'Sinkronisasi Ditunda'
          );
        }
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || 'Terjadi gangguan saat sinkronisasi data.', 'error', 'Sinkronisasi Gagal');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (pendingCount === 0) {
    return null;
  }

  return (
    <div 
      id="sync-notification-banner"
      className="mb-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
          {isOnline ? (
            <CloudAlert className="w-5 h-5 animate-pulse" />
          ) : (
            <WifiOff className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
              {isOnline ? 'Data Belum Tersimpan di Server' : 'Mode Offline Terdeteksi'}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
              {pendingCount} Entri Tertunda
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            {pendingCount} entri baru tersimpan di memori perangkat ini dan belum masuk ke Cloud Database Firestore.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
        <button
          type="button"
          id="btn-sync-now"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer min-h-[42px] disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Mensinkronkan ke DB...' : 'Sinkronkan Sekarang'}</span>
        </button>
      </div>
    </div>
  );
}
