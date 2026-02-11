import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
        if (result) {
          setScanning(false);
          onScan(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          // NotFoundException is expected when no barcode is in frame
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err instanceof DOMException && err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Could not start camera. Please try again.');
        }
      });

    return () => {
      reader.reset();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <h3 className="text-text font-bold text-lg">Scan Barcode</h3>
        <button
          onClick={onClose}
          className="text-text hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>
      </div>

      {/* Camera viewfinder */}
      <div className="relative w-full max-w-md aspect-[4/3]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-xl"
        />
        {/* Scan overlay */}
        {scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 border-2 border-primary rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
              <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-primary/60 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="mt-6 text-center px-4">
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : scanning ? (
          <p className="text-text-muted text-sm">
            Point your camera at a barcode (EAN-13, UPC-A, Code 128)
          </p>
        ) : (
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-medium">Barcode detected!</span>
          </div>
        )}
      </div>
    </div>
  );
}
