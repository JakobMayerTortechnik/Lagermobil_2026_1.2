"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Item } from '@/lib/types';

interface SalesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (commission: string) => void;
  item: Item | null;
}

export function SalesDialog({ isOpen, onOpenChange, onConfirm, item }: SalesDialogProps) {
  const [commission, setCommission] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCommission('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (commission.trim()) {
      onConfirm(commission);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verkauf protokollieren</DialogTitle>
          <DialogDescription>
            Geben Sie eine Kommissions- oder Auftragsnummer für den Verbrauch von {item?.incrementStep}x "{item?.name}" an.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="commission" className="text-right">
              Kommission
            </Label>
            <Input
              id="commission"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="col-span-3"
              placeholder="z.B. AU-12345"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button type="submit" onClick={handleConfirm} disabled={!commission.trim()}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
