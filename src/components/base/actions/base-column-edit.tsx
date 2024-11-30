import { type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type BaseColumnEditProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;

  columnId: string;
};

export const BaseColumnEdit = ({
  open,
  setOpen,
  columnId,
}: BaseColumnEditProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Column</DialogTitle>
        </DialogHeader>
        <h1>{columnId}</h1>
      </DialogContent>
    </Dialog>
  );
};
