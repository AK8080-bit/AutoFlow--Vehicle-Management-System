import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, notification.duration || 3500);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const isSuccess = notification.type === "success" || !notification.type;
  const isError = notification.type === "error";

  return (
    <div className={`modern-toast-container ${isSuccess ? "toast-success" : isError ? "toast-error" : "toast-info"}`}>
      <div className="toast-icon-wrap">
        {isSuccess && <CheckCircle2 size={22} className="toast-icon-success" />}
        {isError && <AlertCircle size={22} className="toast-icon-error" />}
        {!isSuccess && !isError && <Info size={22} className="toast-icon-info" />}
      </div>

      <div className="toast-text-wrap">
        <h4 className="toast-title">{notification.title || (isSuccess ? "Success" : isError ? "Error" : "Notice")}</h4>
        <p className="toast-message">{notification.message}</p>
      </div>

      <button type="button" onClick={onClose} className="toast-close-btn" title="Dismiss notification">
        <X size={15} />
      </button>

      <div className="toast-progress-bar"></div>
    </div>
  );
}

export default NotificationToast;
