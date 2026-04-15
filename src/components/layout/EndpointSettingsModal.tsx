import { useState } from "react";
import { Modal } from "../ui/Modal";
import { MINISTACK_ENDPOINT } from "../../services/awsClients";
import { RefreshCw, Globe, Server, RotateCcw } from "lucide-react";

interface EndpointSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const EndpointSettingsModal = ({ open, onClose }: EndpointSettingsModalProps) => {
  const [newEndpoint, setNewEndpoint] = useState(MINISTACK_ENDPOINT);

  const handleSave = () => {
    if (!newEndpoint.trim()) return;
    localStorage.setItem("ministack-endpoint", newEndpoint.trim());
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem("ministack-endpoint");
    window.location.reload();
  };

  return (
    <Modal open={open} onClose={onClose} title="MiniStack Connection Settings">
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            MiniStack Server URL
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Server className="h-4 w-4 text-text-muted group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
              placeholder="http://localhost:4566"
              className="block w-full pl-10 pr-3 py-2.5 bg-surface-base border border-border-default rounded-btn text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <p className="mt-2 text-[11px] text-text-muted leading-relaxed">
            The URL and port where your MiniStack server is running. Changes require a page reload.
          </p>
        </div>

        <div className="bg-surface-elevated/50 border border-border-subtle rounded-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-primary">External Access</h4>
              <p className="text-xs text-text-muted mt-1 leading-normal">
                Pointing to a remote MiniStack? Make sure it's accessible from your browser and CORS is allowed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-btn shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Save and Reload
          </button>
          <button
            onClick={handleReset}
            title="Reset to default"
            className="px-4 py-2.5 bg-surface-elevated hover:bg-surface-active text-text-muted hover:text-text-primary text-sm font-medium rounded-btn border border-border-subtle transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </Modal>
  );
};
