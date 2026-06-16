"use client";

import {
  toast,
  ToastContainer,
  Slide,
  type CloseButtonProps,
  type ToastOptions,
  type TypeOptions,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/toast.css";

const AUTO_CLOSE_MS = 3500;

type ToastVariant = Exclude<TypeOptions, "default">;

const VARIANT_STYLES: Record<ToastVariant, { iconWrap: string; iconColor: string }> = {
  success: { iconWrap: "bg-emerald-50", iconColor: "text-emerald-600" },
  error: { iconWrap: "bg-rose-50", iconColor: "text-rose-600" },
  info: { iconWrap: "bg-violet-50", iconColor: "text-violet-600" },
  warning: { iconWrap: "bg-amber-50", iconColor: "text-amber-600" },
};

function SuccessIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const VARIANT_ICONS: Record<ToastVariant, () => React.JSX.Element> = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningIcon,
};

function CloseIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

type AppToastCardProps = {
  message: string;
  variant: ToastVariant;
  closeToast: CloseButtonProps["closeToast"];
};

function AppToastCard({ message, variant, closeToast }: AppToastCardProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = VARIANT_ICONS[variant];

  return (
    <div
      className="pointer-events-auto flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm"
      role="status"
    >
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${styles.iconWrap} ${styles.iconColor}`}
      >
        <Icon />
      </div>
      <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-slate-700">{message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={closeToast}
        className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

const BASE_OPTIONS: ToastOptions = {
  icon: false,
  closeButton: false,
  hideProgressBar: false,
  autoClose: AUTO_CLOSE_MS,
  className: "app-toast-shell",
};

function showToast(variant: ToastVariant, message: string, options?: ToastOptions) {
  const content = ({ closeToast }: { closeToast: CloseButtonProps["closeToast"] }) => (
    <AppToastCard message={message} variant={variant} closeToast={closeToast} />
  );

  switch (variant) {
    case "success":
      return toast.success(content, { ...BASE_OPTIONS, ...options });
    case "error":
      return toast.error(content, { ...BASE_OPTIONS, ...options });
    case "warning":
      return toast.warning(content, { ...BASE_OPTIONS, ...options });
    default:
      return toast.info(content, { ...BASE_OPTIONS, ...options });
  }
}

export function notifySuccess(message: string, options?: ToastOptions) {
  return showToast("success", message, options);
}

export function notifyError(message: string, options?: ToastOptions) {
  return showToast("error", message, options);
}

export function notifyInfo(message: string, options?: ToastOptions) {
  return showToast("info", message, options);
}

export function notifyWarning(message: string, options?: ToastOptions) {
  return showToast("warning", message, options);
}

export function AppToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={AUTO_CLOSE_MS}
      newestOnTop
      closeOnClick={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      limit={3}
      transition={Slide}
      icon={false}
      closeButton={false}
      hideProgressBar={false}
      className="app-toast-container"
      toastClassName="app-toast-shell"
    />
  );
}
