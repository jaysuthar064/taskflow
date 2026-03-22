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

  const profileHighlights = [
    {
      label: "Member Since",
      value: formatAccountDate(user?.createdAt),
      icon: <CalendarDays size={16} />,
      tone: "bg-sky-50 text-sky-700 border-sky-100"
    },
    {
      label: "Account Type",
      value: user?.role === "admin" ? "Admin" : "Member",
      icon: <User size={16} />,
      tone: "bg-violet-50 text-violet-700 border-violet-100"
    },
    {
      label: "Sign In",
      value: loginMethodsLabel,
      icon: <KeyRound size={16} />,
      tone: "bg-amber-50 text-amber-700 border-amber-100"
    },
    {
      label: "Authenticator",
      value: user?.security?.twoFactorEnabled ? "Enabled" : "Required",
      icon: <ShieldCheck size={16} />,
      tone: user?.security?.twoFactorEnabled
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-rose-50 text-rose-700 border-rose-100"
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
    (pushPermission === "denied" && !pushSubscribed) ||
    (!pushConfigured && !pushSubscribed);

  const pushButtonLabel = pushLoading
    ? "Updating..."
    : pushSubscribed
      ? "Disable Notifications"
      : pushPermission === "denied"
        ? "Notifications Blocked"
        : "Enable Notifications";

  const pushStatusLabel = !pushSupported
    ? "Unsupported"
    : pushSubscribed
      ? "Enabled"
      : pushPermission === "denied"
        ? "Blocked"
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-surface-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-surface-500 mt-1">Manage your profile, devices, and security preferences.</p>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-[1.75rem] border border-surface-200 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 border-b border-surface-100 bg-gradient-to-br from-primary-50 via-white to-amber-50">
          <div className="flex flex-col gap-5 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-primary-500/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-600">Profile</p>
                <h3 className="mt-2 text-xl sm:text-2xl font-bold text-surface-900 break-words">{user?.name || "User"}</h3>
                <p className="mt-1 text-sm text-surface-500 break-all">{user?.email || "name@example.com"}</p>
                <p className="mt-3 text-sm text-surface-600 max-w-2xl">
                  Your email stays fixed to keep sign-in, reminders, and authenticator setup stable across every device.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-surface-500">Security Status</p>
              <p className="mt-2 text-sm font-semibold text-surface-900">
                {user?.security?.twoFactorEnabled
                  ? "Authenticator protection is active."
                  : "Enable the authenticator below before changing your password."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
            {profileHighlights.map(({ label, value, icon, tone }) => (
              <div key={label} className={`rounded-2xl border px-4 py-4 ${tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</p>
                  {icon}
                </div>
                <p className="mt-3 text-base font-bold text-surface-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-5">
          {message.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl text-sm px-4 py-3 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
              <p className="text-xs text-surface-500">This is the only profile field you can edit here.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  aria-readonly="true"
                  className="w-full bg-surface-100 border border-surface-200 rounded-xl text-sm pl-11 pr-4 py-3 text-surface-500 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-surface-500">Email is fixed for this account and cannot be changed.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
            <p className="text-sm font-semibold text-surface-900">Password changes are handled in Security Center.</p>
            <p className="mt-1 text-xs text-surface-600">
              Every password update is confirmed with your authenticator app instead of paid OTP delivery.
            </p>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="btn-primary flex items-center px-6 py-2.5"
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

      <div className="w-full max-w-4xl bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between gap-4 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">Notifications</h3>
              <p className="text-xs text-surface-500">Manage browser push reminders for this device.</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
              pushSubscribed
                ? "bg-green-100 text-green-700"
                : pushPermission === "denied"
                  ? "bg-red-100 text-red-700"
                  : "bg-surface-100 text-surface-600"
            }`}
          >
            {pushStatusLabel}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
            <p className="text-sm font-semibold text-surface-900">Browser reminder delivery</p>
            <p className="mt-1 text-xs text-surface-600">
              Enable this once per browser to receive reminders even when the TaskFlow tab is closed.
            </p>
            <p className="mt-2 text-[11px] text-surface-500">
              Android Chrome can use local scheduled reminders when supported. Production still requires HTTPS.
            </p>
          </div>

          {pushError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
              {pushError}
            </div>
          )}

          {!pushSupported && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              This browser does not support push notifications.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-500">Current Device</p>
              <p className="mt-1 text-sm font-semibold text-surface-900">
                {pushSubscribed ? "Notifications are enabled for this browser." : "Notifications are currently off for this browser."}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePushNotifications}
              disabled={isPushActionDisabled || !pushSupported}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border transition-colors ${
                pushSubscribed
                  ? "bg-surface-900 text-white border-surface-900 hover:bg-surface-800"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
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

      <div className="w-full max-w-4xl bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between gap-4 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">Install App</h3>
              <p className="text-xs text-surface-500">Add TaskFlow to your home screen and app drawer.</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
              isInstalled
                ? "bg-green-100 text-green-700"
                : canInstall
                  ? "bg-primary-100 text-primary-700"
                  : "bg-surface-100 text-surface-600"
            }`}
          >
            {installStatusLabel}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
            <p className="text-sm font-semibold text-surface-900">App-style experience</p>
            <p className="mt-1 text-xs text-surface-600">
              Installing TaskFlow gives you standalone full-screen launching and can make mobile reminders feel more native.
            </p>
          </div>

          <div className="rounded-xl border border-surface-100 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-surface-900">
              {isInstalled ? "TaskFlow is already installed." : "Install status"}
            </p>
            <p className="mt-1 text-xs text-surface-600">{installHint}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-500">Current Device</p>
              <p className="mt-1 text-sm font-semibold text-surface-900">
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
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border bg-primary-600 text-white border-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
