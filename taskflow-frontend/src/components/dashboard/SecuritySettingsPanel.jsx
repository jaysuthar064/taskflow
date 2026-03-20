import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2
} from "lucide-react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const emptyMessage = { text: "", type: "" };

const formatDateTime = (value) => {
  if (!value) {
    return "Unavailable";
  }

  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return "Unavailable";
  }
};

const MessageBanner = ({ message }) => {
  if (!message?.text) {
    return null;
  }

  const styles = {
    success: "border-green-100 bg-green-50 text-green-700",
    error: "border-red-100 bg-red-50 text-red-700",
    info: "border-primary-100 bg-primary-50 text-primary-700"
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-xs font-medium ${styles[message.type] || styles.info}`}>
      {message.text}
    </div>
  );
};

const SecuritySettingsPanel = () => {
  const navigate = useNavigate();
  const { user, token, login, logout, forceLocalLogout } = useContext(AuthContext);
  const [securityState, setSecurityState] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isRefreshingOverview, setIsRefreshingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    totpCode: ""
  });
  const [passwordMessage, setPasswordMessage] = useState(emptyMessage);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorSetupCode, setTwoFactorSetupCode] = useState("");
  const [twoFactorDisableForm, setTwoFactorDisableForm] = useState({
    currentPassword: "",
    code: ""
  });
  const [twoFactorMessage, setTwoFactorMessage] = useState(emptyMessage);
  const [isWorkingTwoFactor, setIsWorkingTwoFactor] = useState(false);
  const [sessionsMessage, setSessionsMessage] = useState(emptyMessage);
  const [activeSessionAction, setActiveSessionAction] = useState("");
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    confirmationText: "",
    currentPassword: "",
    totpCode: ""
  });
  const [deleteMessage, setDeleteMessage] = useState(emptyMessage);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const syncUser = useCallback((nextUser) => {
    if (token && nextUser) {
      login(token, nextUser);
    }
  }, [login, token]);

  const loadSecurityOverview = useCallback(async ({ showLoader = false } = {}) => {
    if (!token) {
      return;
    }

    if (showLoader) {
      setIsLoadingOverview(true);
    } else {
      setIsRefreshingOverview(true);
    }

    try {
      const response = await API.get("/security/overview");
      const nextState = response.data?.data || null;
      setSecurityState(nextState);
      setOverviewError("");

      if (nextState?.twoFactor?.enabled) {
        setTwoFactorSetup(null);
        setTwoFactorSetupCode("");
      }
    } catch (error) {
      setOverviewError(error.response?.data?.message || "Unable to load security settings.");
    } finally {
      setIsLoadingOverview(false);
      setIsRefreshingOverview(false);
    }
  }, [token]);

  useEffect(() => {
    loadSecurityOverview({ showLoader: true });
  }, [loadSecurityOverview]);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage(emptyMessage);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        text: "New password and confirmation do not match.",
        type: "error"
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await API.put("/security/password", {
        currentPassword: securityState?.loginMethods?.password ? passwordForm.currentPassword : "",
        newPassword: passwordForm.newPassword,
        totpCode: securityState?.twoFactor?.enabled ? passwordForm.totpCode : ""
      });

      syncUser(response.data?.user);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        totpCode: ""
      });
      setPasswordMessage({
        text: response.data?.message || "Password updated successfully.",
        type: "success"
      });
      await loadSecurityOverview();
    } catch (error) {
      setPasswordMessage({
        text: error.response?.data?.message || "Unable to update password.",
        type: "error"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleStartTwoFactorSetup = async () => {
    setTwoFactorMessage(emptyMessage);
    setIsWorkingTwoFactor(true);

    try {
      const response = await API.post("/security/2fa/setup");
      setTwoFactorSetup(response.data?.data || null);
      setTwoFactorSetupCode("");
      setTwoFactorMessage({
        text: "Add this key to your authenticator app, then enter the 6-digit code to finish setup.",
        type: "info"
      });
    } catch (error) {
      setTwoFactorMessage({
        text: error.response?.data?.message || "Unable to start two-factor setup.",
        type: "error"
      });
    } finally {
      setIsWorkingTwoFactor(false);
    }
  };

  const handleCopySecret = async () => {
    if (!twoFactorSetup?.secret || !navigator?.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(twoFactorSetup.secret);
      setTwoFactorMessage({
        text: "Authenticator key copied to your clipboard.",
        type: "success"
      });
    } catch (error) {
      setTwoFactorMessage({
        text: "Unable to copy the authenticator key.",
        type: "error"
      });
    }
  };

  const handleConfirmTwoFactorSetup = async (event) => {
    event.preventDefault();
    setTwoFactorMessage(emptyMessage);
    setIsWorkingTwoFactor(true);

    try {
      const response = await API.post("/security/2fa/confirm", {
        code: twoFactorSetupCode
      });

      syncUser(response.data?.user);
      setTwoFactorSetup(null);
      setTwoFactorSetupCode("");
      setTwoFactorMessage({
        text: response.data?.message || "Two-factor authentication enabled successfully.",
        type: "success"
      });
      await loadSecurityOverview();
    } catch (error) {
      setTwoFactorMessage({
        text: error.response?.data?.message || "Unable to verify that code.",
        type: "error"
      });
    } finally {
      setIsWorkingTwoFactor(false);
    }
  };

  const handleDisableTwoFactor = async (event) => {
    event.preventDefault();
    setTwoFactorMessage(emptyMessage);
    setIsWorkingTwoFactor(true);

    try {
      const response = await API.post("/security/2fa/disable", {
        currentPassword: securityState?.loginMethods?.password ? twoFactorDisableForm.currentPassword : "",
        code: twoFactorDisableForm.code
      });

      syncUser(response.data?.user);
      setTwoFactorDisableForm({
        currentPassword: "",
        code: ""
      });
      setTwoFactorMessage({
        text: response.data?.message || "Two-factor authentication disabled.",
        type: "success"
      });
      await loadSecurityOverview();
    } catch (error) {
      setTwoFactorMessage({
        text: error.response?.data?.message || "Unable to disable two-factor authentication.",
        type: "error"
      });
    } finally {
      setIsWorkingTwoFactor(false);
    }
  };

  const handleSignOutSession = async (session) => {
    if (!session) {
      return;
    }

    if (session.isCurrent) {
      const confirmed = window.confirm("Sign out this device now?");

      if (!confirmed) {
        return;
      }

      await logout();
      navigate("/login", { replace: true });
      return;
    }

    setSessionsMessage(emptyMessage);
    setActiveSessionAction(session.id);

    try {
      const response = await API.delete(`/security/sessions/${session.id}`);
      setSessionsMessage({
        text: response.data?.message || "Session signed out successfully.",
        type: "success"
      });
      await loadSecurityOverview();
    } catch (error) {
      setSessionsMessage({
        text: error.response?.data?.message || "Unable to sign out that session.",
        type: "error"
      });
    } finally {
      setActiveSessionAction("");
    }
  };

  const handleLogoutAllSessions = async () => {
    const confirmed = window.confirm("Sign out every device and browser for this account?");

    if (!confirmed) {
      return;
    }

    setSessionsMessage(emptyMessage);
    setIsSigningOutAll(true);

    try {
      await API.post("/security/sessions/logout-all");
      forceLocalLogout();
      navigate("/login", { replace: true });
    } catch (error) {
      setSessionsMessage({
        text: error.response?.data?.message || "Unable to sign out all devices.",
        type: "error"
      });
    } finally {
      setIsSigningOutAll(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteMessage(emptyMessage);

    const confirmed = window.confirm("Delete this account permanently? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      await API.delete("/account", {
        data: {
          confirmationText: deleteForm.confirmationText,
          currentPassword: securityState?.loginMethods?.password ? deleteForm.currentPassword : "",
          totpCode: securityState?.twoFactor?.enabled ? deleteForm.totpCode : ""
        }
      });

      forceLocalLogout();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteMessage({
        text: error.response?.data?.message || "Unable to delete your account.",
        type: "error"
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const cardClass = "max-w-4xl bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm";
  const inputClass = "w-full bg-surface-50 border-surface-200 rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all";
  const dangerInputClass = "w-full bg-white border-red-200 rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all";

  if (isLoadingOverview) {
    return (
      <div className="max-w-4xl bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
        <div className="flex items-center text-sm text-surface-500">
          <Loader2 size={16} className="mr-2 animate-spin" />
          Loading security settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="p-6 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">Security Center</h3>
              <p className="text-xs text-surface-500">Manage sign-in methods, 2FA, sessions, and account deletion.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadSecurityOverview()}
            disabled={isRefreshingOverview}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] border border-surface-200 bg-white text-surface-700 hover:border-primary-300 disabled:opacity-60"
          >
            {isRefreshingOverview ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
            Refresh
          </button>
        </div>
        <div className="p-6 space-y-4">
          {overviewError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {overviewError}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-surface-500">Password</p>
              <p className="mt-2 text-lg font-bold text-surface-900">{securityState?.loginMethods?.password ? "Enabled" : "Not Set"}</p>
            </div>
            <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-surface-500">Google</p>
              <p className="mt-2 text-lg font-bold text-surface-900">{securityState?.loginMethods?.google ? "Connected" : "Not Connected"}</p>
            </div>
            <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-surface-500">2FA</p>
              <p className="mt-2 text-lg font-bold text-surface-900">{securityState?.twoFactor?.enabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-surface-500">Sessions</p>
              <p className="mt-2 text-lg font-bold text-surface-900">{securityState?.activeSessionCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="p-6 border-b border-surface-100 flex items-center space-x-3 bg-surface-50/50">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">{securityState?.loginMethods?.password ? "Change Password" : "Set Password"}</h3>
            <p className="text-xs text-surface-500">{securityState?.loginMethods?.password ? "Changing it signs out your other devices." : "Create email/password access for this account."}</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          <MessageBanner message={passwordMessage} />
          {securityState?.loginMethods?.password && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} required />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className={inputClass} minLength={8} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Confirm Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className={inputClass} minLength={8} required />
            </div>
          </div>
          {securityState?.twoFactor?.enabled && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Authenticator Code</label>
              <input type="text" inputMode="numeric" maxLength={6} value={passwordForm.totpCode} onChange={(event) => setPasswordForm((current) => ({ ...current, totpCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} className={inputClass} placeholder="123456" required />
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={isUpdatingPassword} className="btn-primary flex items-center px-6 py-2.5">
              {isUpdatingPassword ? <Loader2 size={16} className="mr-2 animate-spin" /> : <KeyRound size={16} className="mr-2" />}
              {securityState?.loginMethods?.password ? "Update Password" : "Create Password"}
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <div className="p-6 border-b border-surface-100 flex items-center space-x-3 bg-surface-50/50">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">Two-Factor Authentication</h3>
            <p className="text-xs text-surface-500">Use any TOTP app, then enter the 6-digit code on login.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <MessageBanner message={twoFactorMessage} />
          {!securityState?.twoFactor?.enabled && !twoFactorSetup && (
            <button type="button" onClick={handleStartTwoFactorSetup} disabled={isWorkingTwoFactor} className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
              {isWorkingTwoFactor ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
              Start Setup
            </button>
          )}
          {!securityState?.twoFactor?.enabled && twoFactorSetup && (
            <form onSubmit={handleConfirmTwoFactorSetup} className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-surface-900">Manual Setup Key</p>
                  <p className="text-xs text-surface-600 mt-1">Add this key to Google Authenticator, 1Password, Authy, or Microsoft Authenticator.</p>
                </div>
                <button type="button" onClick={handleCopySecret} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] border border-surface-200 bg-white text-surface-700 hover:border-primary-300">
                  <Copy size={12} className="mr-2" />
                  Copy Key
                </button>
              </div>
              <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm font-semibold tracking-[0.24em] text-surface-900 break-all">
                {twoFactorSetup.manualEntryKey}
              </div>
              <input type="text" inputMode="numeric" maxLength={6} value={twoFactorSetupCode} onChange={(event) => setTwoFactorSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} placeholder="123456" required />
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={isWorkingTwoFactor} className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
                  {isWorkingTwoFactor ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
                  Verify and Enable
                </button>
                <button type="button" onClick={handleStartTwoFactorSetup} disabled={isWorkingTwoFactor} className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border border-surface-200 bg-white text-surface-700 hover:border-primary-300 disabled:opacity-60">
                  Regenerate Key
                </button>
              </div>
            </form>
          )}
          {securityState?.twoFactor?.enabled && (
            <form onSubmit={handleDisableTwoFactor} className="space-y-4">
              {securityState?.loginMethods?.password && <input type="password" value={twoFactorDisableForm.currentPassword} onChange={(event) => setTwoFactorDisableForm((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} placeholder="Current password" required />}
              <input type="text" inputMode="numeric" maxLength={6} value={twoFactorDisableForm.code} onChange={(event) => setTwoFactorDisableForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, "").slice(0, 6) }))} className={inputClass} placeholder="Authenticator code" required />
              <button type="submit" disabled={isWorkingTwoFactor} className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 disabled:opacity-60">
                {isWorkingTwoFactor ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
                Disable Two-Factor Auth
              </button>
            </form>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="p-6 border-b border-surface-100 flex items-center space-x-3 bg-surface-50/50">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">Active Sessions</h3>
            <p className="text-xs text-surface-500">Review and sign out devices you do not recognize.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <MessageBanner message={sessionsMessage} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-surface-600">Logging out all devices also clears saved browser reminder subscriptions.</p>
            <button type="button" onClick={handleLogoutAllSessions} disabled={isSigningOutAll} className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border bg-surface-900 text-white border-surface-900 hover:bg-surface-800 disabled:opacity-60">
              {isSigningOutAll ? <Loader2 size={14} className="mr-2 animate-spin" /> : <LogOut size={14} className="mr-2" />}
              Logout All Devices
            </button>
          </div>
          <div className="space-y-3">
            {(securityState?.sessions || []).map((session) => (
              <div key={session.id} className="rounded-2xl border border-surface-100 bg-surface-50 p-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-surface-900">{session.deviceLabel}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${session.isCurrent ? "bg-primary-100 text-primary-700" : "bg-surface-200 text-surface-600"}`}>{session.isCurrent ? "Current" : "Active"}</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-amber-100 text-amber-700">{session.loginMethod}</span>
                  </div>
                  <p className="text-xs text-surface-600">{session.browser} on {session.os}{session.ipAddress ? ` - ${session.ipAddress}` : ""}</p>
                  <div className="text-[11px] text-surface-500 space-y-1">
                    <p>Last active: {formatDateTime(session.lastActiveAt)}</p>
                    <p>Signed in: {formatDateTime(session.createdAt)}</p>
                    <p>{session.twoFactorVerified ? "Passed two-factor verification" : "No two-factor verification recorded"}</p>
                  </div>
                </div>
                <button type="button" onClick={() => handleSignOutSession(session)} disabled={activeSessionAction === session.id} className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border ${session.isCurrent ? "bg-surface-900 text-white border-surface-900 hover:bg-surface-800" : "bg-white text-surface-700 border-surface-200 hover:border-primary-300"} disabled:opacity-60`}>
                  {activeSessionAction === session.id ? <Loader2 size={14} className="mr-2 animate-spin" /> : <LogOut size={14} className="mr-2" />}
                  {session.isCurrent ? "Logout This Device" : "Sign Out Device"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl bg-red-50/60 border border-red-100 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900">Delete Account</h3>
            <p className="text-xs text-red-700 mt-1">This permanently removes your profile, tasks, notifications, sessions, and reminder subscriptions.</p>
          </div>
        </div>
        <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
          <MessageBanner message={deleteMessage} />
          <input type="text" value={deleteForm.confirmationText} onChange={(event) => setDeleteForm((current) => ({ ...current, confirmationText: event.target.value }))} placeholder={user?.email || "name@example.com"} className={dangerInputClass} required />
          {securityState?.loginMethods?.password && <input type="password" value={deleteForm.currentPassword} onChange={(event) => setDeleteForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Current password" className={dangerInputClass} required />}
          {securityState?.twoFactor?.enabled && <input type="text" inputMode="numeric" maxLength={6} value={deleteForm.totpCode} onChange={(event) => setDeleteForm((current) => ({ ...current, totpCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="Authenticator code" className={dangerInputClass} required />}
          <button type="submit" disabled={isDeletingAccount} className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] border bg-red-600 text-white border-red-600 hover:bg-red-700 disabled:opacity-60">
            {isDeletingAccount ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Trash2 size={14} className="mr-2" />}
            Delete My Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettingsPanel;
