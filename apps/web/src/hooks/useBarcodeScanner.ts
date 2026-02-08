import { useState, useCallback } from 'react';
import { productsService } from '@/services/products.service';
import type { Product } from '@shopwise/shared';

export function useBarcodeScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  const openScanner = useCallback(() => {
    setIsOpen(true);
    setScannedProduct(null);
    setNotFound(false);
    setLastBarcode(null);
  }, []);

  const closeScanner = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleScan = useCallback(async (barcode: string) => {
    setLastBarcode(barcode);
    setIsOpen(false);
    try {
      const product = await productsService.findByBarcode(barcode);
      if (product) {
        setScannedProduct(product);
        setNotFound(false);
      } else {
        setScannedProduct(null);
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, []);

  const clearResult = useCallback(() => {
    setScannedProduct(null);
    setNotFound(false);
    setLastBarcode(null);
  }, []);

  return {
    isOpen,
    openScanner,
    closeScanner,
    handleScan,
    scannedProduct,
    notFound,
    lastBarcode,
    clearResult,
  };
}
