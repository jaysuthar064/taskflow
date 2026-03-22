import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  CalendarDays,
  Download,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User
} from "lucide-react";
import API from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import SecuritySettingsPanel from "./SecuritySettingsPanel";

const formatAccountDate = (value) => {
  if (!value) {
    return "Recently joined";
  }

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "Recently joined";
  }
};

const SettingsView = ({ notificationSettings, installSettings }) => {
  const { user, token, login } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const {
    supported: pushSupported,
    configured: pushConfigured,
    subscribed: pushSubscribed,
    permission: pushPermission,
    loading: pushLoading,
    ready: pushReady,
    error: pushError,
    enablePushNotifications,
    disablePushNotifications
  } = notificationSettings;
  const {
    canInstall,
    isInstalled,
    isInstalling,
    installApp,
    installHint
  } = installSettings;

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const loginMethodsLabel = [
    user?.loginMethods?.password ? "Password" : null,
    user?.loginMethods?.google ? "Google" : null
  ]
    .filter(Boolean)
    .join(" + ") || "Password";

  const panelClass = "w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#303134] shadow-[0_12px_30px_rgba(0,0,0,0.22)]";
  const sectionHeaderClass = "border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(138,180,248,0.16),transparent_32%),linear-gradient(180deg,#303134_0%,#2a2b2f_100%)]";
  const labelClass = "text-xs font-bold uppercase tracking-wider text-[#bdc1c6]";
  const inputClass = "w-full rounded-xl border border-[#5f6368] bg-[#202124] px-4 py-3 text-sm text-[#e8eaed] outline-none transition-colors placeholder:text-[#9aa0a6] focus:border-[#8ab4f8]";
  const readOnlyInputClass = "w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#26272b] py-3 pl-11 pr-4 text-sm text-[#9aa0a6] outline-none";
  const primaryButtonClass = "inline-flex items-center justify-center rounded-xl bg-[#8ab4f8] px-6 py-2.5 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#9fc1fa] disabled:cursor-not-allowed disabled:opacity-60";

  const profileHighlights = [
    {
      label: "Member Since",
      value: formatAccountDate(user?.createdAt),
      icon: <CalendarDays size={16} />,
      tone: "border border-sky-400/20 bg-sky-500/10 text-sky-100"
    },
    {
      label: "Account Type",
      value: user?.role === "admin" ? "Admin" : "Member",
      icon: <User size={16} />,
      tone: "border border-violet-400/20 bg-violet-500/10 text-violet-100"
    },
    {
      label: "Sign In",
      value: loginMethodsLabel,
      icon: <KeyRound size={16} />,
      tone: "border border-amber-300/20 bg-amber-400/10 text-amber-100"
    },
    {
      label: "Authenticator",
      value: user?.security?.twoFactorEnabled ? "Enabled" : "Required",
      icon: <ShieldCheck size={16} />,
      tone: user?.security?.twoFactorEnabled
        ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
        : "border border-rose-400/20 bg-rose-500/10 text-rose-100"
    }
  ];

  const handlePushNotifications = async () => {
    if (pushSubscribed) {
      await disablePushNotifications();
      return;
    }

    await enablePushNotifications();
  };

  const isPushActionDisabled =
    pushLoading ||
    !pushReady ||
    (pushPermission === "denied" && !pushSubscribed);

  const pushButtonLabel = pushLoading
    ? "Updating..."
    : pushSubscribed
      ? "Disable Notifications"
      : pushPermission === "granted"
        ? pushConfigured
          ? "Enable Push Delivery"
          : "Notifications Allowed"
        : pushPermission === "denied"
          ? "Notifications Blocked"
          : "Enable Notifications";

  const pushStatusLabel = !pushSupported
    ? "Unsupported"
    : pushSubscribed
      ? "Enabled"
      : pushPermission === "granted"
        ? pushConfigured
          ? "Ready"
          : "Local Only"
        : pushPermission === "denied"
          ? "Notifications Blocked"
          : pushConfigured
            ? "Disabled"
            : "Server Setup Needed";

  const installStatusLabel = isInstalled
    ? "Installed"
    : canInstall
      ? "Ready"
      : "Use Menu";

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setIsUpdating(true);
    setMessage({ text: "", type: "" });

    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage({
        text: "Name is required.",
        type: "error"
      });
      setIsUpdating(false);
      return;
    }

    try {
      const response = await API.put("/profile", { name: trimmedName });

      if (response.data.user) {
        login(token, response.data.user);
        setMessage({ text: "Profile updated successfully.", type: "success" });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to update profile.",
        type: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#e8eaed]">Account Settings</h2>
        <p className="mt-1 text-sm text-[#9aa0a6]">Manage your profile, devices, and security preferences.</p>
      </div>

      <div className={panelClass}>
        <div className={`p-4 sm:p-8 ${sectionHeaderClass}`}>
          <div className="flex flex-col gap-5 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8ab4f8] to-[#5f8be8] text-lg font-black text-[#202124] shadow-lg shadow-[#8ab4f8]/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#8ab4f8]">Profile</p>
                <h3 className="mt-2 break-words text-xl font-bold text-[#e8eaed] sm:text-2xl">{user?.name || "User"}</h3>
                <p className="mt-1 break-all text-sm text-[#9aa0a6]">{user?.email || "name@example.com"}</p>
                <p className="mt-3 max-w-2xl text-sm text-[#bdc1c6]">
                  Your email stays fixed to keep sign-in, reminders, and authenticator setup stable across every device.
                </p>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-white/10 bg-[#202124]/80 px-4 py-3 backdrop-blur min-[480px]:w-auto">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#9aa0a6]">Security Status</p>
              <p className="mt-2 text-sm font-semibold text-[#e8eaed]">
                {user?.security?.twoFactorEnabled
                  ? "Authenticator protection is active."
                  : "Enable the authenticator below before changing your password."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
            {profileHighlights.map(({ label, value, icon, tone }) => (
              <div key={label} className={`rounded-2xl px-4 py-4 ${tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</p>
                  {icon}
                </div>
                <p className="mt-3 text-base font-bold text-current">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-4 sm:p-8 space-y-5">
          {message.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                message.type === "success"
                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                  : "border border-rose-400/20 bg-rose-500/10 text-rose-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-[#9aa0a6]">This is the only profile field you can edit here.</p>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  aria-readonly="true"
                  className={readOnlyInputClass}
                />
              </div>
              <p className="text-xs text-[#9aa0a6]">Email is fixed for this account and cannot be changed.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-4">
            <p className="text-sm font-semibold text-amber-100">Password changes are handled in Security Center.</p>
            <p className="mt-1 text-xs text-amber-50/80">
              Every password update is confirmed with your authenticator app instead of paid OTP delivery.
            </p>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className={`w-full sm:w-auto ${primaryButtonClass}`}
            >
              {isUpdating ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Name
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className={panelClass}>
        <div className={`p-4 sm:p-6 flex flex-col gap-4 border-b border-white/10 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between ${sectionHeaderClass}`}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-200">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8eaed]">Notifications</h3>
              <p className="text-xs text-[#9aa0a6]">Manage browser push reminders for this device.</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
              pushSubscribed
                ? "bg-emerald-500/15 text-emerald-200"
                : pushPermission === "denied"
                  ? "bg-rose-500/15 text-rose-200"
                  : "bg-white/10 text-[#bdc1c6]"
            }`}
          >
            {pushStatusLabel}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#202124] px-4 py-3">
            <p className="text-sm font-semibold text-[#e8eaed]">Browser reminder delivery</p>
            <p className="mt-1 text-xs text-[#bdc1c6]">
              Enable this once per browser to receive reminders even when the TaskFlow tab is closed.
            </p>
            <p className="mt-2 text-[11px] text-[#9aa0a6]">
              Android Chrome can use local scheduled reminders when supported. Production still requires HTTPS.
            </p>
          </div>

          {pushError && (
            <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-xs font-medium text-amber-100">
              {pushError}
            </div>
          )}

          {!pushSupported && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-100">
              This browser does not support push notifications.
            </div>
          )}

          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9aa0a6]">Current Device</p>
              <p className="mt-1 text-sm font-semibold text-[#e8eaed]">
                {pushSubscribed ? "Notifications are enabled for this browser." : "Notifications are currently off for this browser."}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePushNotifications}
              disabled={isPushActionDisabled || !pushSupported}
              className={`inline-flex w-full min-[420px]:w-auto items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border transition-colors ${
                pushSubscribed
                  ? "border-white/10 bg-[#202124] text-[#e8eaed] hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
                  : "border-amber-300/20 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {pushLoading ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : pushSubscribed ? (
                <BellOff size={14} className="mr-2" />
              ) : (
                <Bell size={14} className="mr-2" />
              )}
              {pushButtonLabel}
            </button>
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <div className={`p-4 sm:p-6 flex flex-col gap-4 border-b border-white/10 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between ${sectionHeaderClass}`}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8ab4f8]/15 text-[#8ab4f8]">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8eaed]">Install App</h3>
              <p className="text-xs text-[#9aa0a6]">Add TaskFlow to your home screen and app drawer.</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
              isInstalled
                ? "bg-emerald-500/15 text-emerald-200"
                : canInstall
                  ? "bg-[#8ab4f8]/15 text-[#8ab4f8]"
                  : "bg-white/10 text-[#bdc1c6]"
            }`}
          >
            {installStatusLabel}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#202124] px-4 py-3">
            <p className="text-sm font-semibold text-[#e8eaed]">App-style experience</p>
            <p className="mt-1 text-xs text-[#bdc1c6]">
              Installing TaskFlow gives you standalone full-screen launching and can make mobile reminders feel more native.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#202124] px-4 py-3">
            <p className="text-sm font-semibold text-[#e8eaed]">
              {isInstalled ? "TaskFlow is already installed." : "Install status"}
            </p>
            <p className="mt-1 text-xs text-[#bdc1c6]">{installHint}</p>
          </div>

          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9aa0a6]">Current Device</p>
              <p className="mt-1 text-sm font-semibold text-[#e8eaed]">
                {isInstalled
                  ? "TaskFlow opens like an installed app on this device."
                  : canInstall
                    ? "TaskFlow is ready to install from this browser."
                    : "Use your browser menu if the install prompt is not available yet."}
              </p>
            </div>
            <button
              type="button"
              onClick={installApp}
              disabled={!canInstall || isInstalled || isInstalling}
              className="inline-flex w-full min-[420px]:w-auto items-center justify-center rounded-xl border border-[#8ab4f8] bg-[#8ab4f8] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#202124] transition-colors hover:bg-[#9fc1fa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isInstalling ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <Download size={14} className="mr-2" />
              )}
              {isInstalled ? "Installed" : canInstall ? "Install App" : "Install From Menu"}
            </button>
          </div>
        </div>
      </div>

      <SecuritySettingsPanel />
    </div>
  );
};

export default SettingsView;
