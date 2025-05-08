'use client';

import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmResetModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <DialogContent className="z-50 w-[92%] sm:max-w-sm rounded-2xl border bg-background p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Delete portfolio and restart?
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            No
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
