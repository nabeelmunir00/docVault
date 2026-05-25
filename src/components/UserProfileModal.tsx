"use client";

import { UserProfile } from "@clerk/nextjs";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  open,
  onClose,
}: UserProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" md:max-w-[900px] border-border/60 p-2  my-5 flex items-center justify-center ">
        <UserProfile />
      </DialogContent>
    </Dialog>
  );
}
