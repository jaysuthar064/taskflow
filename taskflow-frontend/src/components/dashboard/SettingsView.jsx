import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Bell, BellOff, Shield, Palette, Save, Loader2 } from "lucide-react";
import API from "../../api/axios";

const SettingsView = ({ notificationSettings }) => {
  const { user, token, login } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await API.put("/profile", { name, email, password });
      
      if (response.data.user) {
        login(token, response.data.user);
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setPassword("");
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-surface-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-surface-500 mt-1">Manage your profile and application preferences.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-100 flex items-center space-x-3 bg-surface-50/50">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                <User size={20} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-surface-900">Profile Information</h3>
                <p className="text-xs text-surface-500">Update your account details and password.</p>
            </div>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            {message.text && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                    message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                    {message.text}
                </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Full Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface-50 border-surface-200 rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-50 border-surface-200 rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">New Password (leave blank to keep current)</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-50 border-surface-200 rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
            </div>

            <div className="pt-2 flex justify-end">
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
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
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
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
            pushSubscribed
              ? "bg-green-100 text-green-700"
              : pushPermission === "denied"
                ? "bg-red-100 text-red-700"
                : "bg-surface-100 text-surface-600"
          }`}>
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

      <div className="grid gap-4">
        {[
          { title: "Security", icon: <Shield size={20} />, desc: "Update session and security settings." },
          { title: "Display", icon: <Palette size={20} />, desc: "Customize the look and feel." },
        ].map((section, i) => (
          <button 
            key={i}
            className="flex items-center p-4 bg-white rounded-xl border border-surface-200 hover:border-primary-300 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-50 flex items-center justify-center text-surface-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              {section.icon}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-bold text-surface-900">{section.title}</h3>
              <p className="text-xs text-surface-500 mt-0.5">{section.desc}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-surface-300 group-hover:text-primary-400">
               →
            </div>
          </button>
        ))}
      </div>

      <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 mt-8">
        <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
        <p className="text-xs text-red-600 mt-1 mb-3">Irreversible actions for your account.</p>
        <button className="text-xs font-bold text-red-600 hover:text-red-700 underline px-0">
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
