import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { useApp } from "@/hooks/useApp";
import { ROUTES } from "@/constants";

export default function ChangeCityModal({ isOpen, onClose }) {
  const { clearCity } = useApp();
  const navigate = useNavigate();

  const handleConfirm = () => {
    clearCity();
    onClose();
    navigate(ROUTES.SELECT_CITY);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Switch metro city?" size="sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
          <RefreshCw className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm text-slate-600">
          Switching cities will reload the dashboard with data for the newly selected metro network.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm}>Yes, switch city</Button>
      </div>
    </Modal>
  );
}
