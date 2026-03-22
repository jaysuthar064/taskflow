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
import { AuthContext } from "../../context/auth-context";

const emptyMessage = { text: "", type: "" };

const formatDateTime = (value) => {
  if (!value) {
    return "Unavailable";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Unavailable";
  }
};

const MessageBanner = ({ message }) => {
  if (!message?.text) {
    return null;
  }

  const styles = {
    success: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    error: "border border-rose-400/20 bg-rose-500/10 text-rose-100",
    info: "border border-[#8ab4f8]/20 bg-[#8ab4f8]/10 text-[#dbe7ff]"
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

  const scrollToTwoFactorSection = () => {
    document.getElementById("two-factor-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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
    const secretToCopy =
      twoFactorSetup?.manualEntryKey?.replace(/\s+/g, "") || twoFactorSetup?.secret || "";

    if (!secretToCopy || !navigator?.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(secretToCopy);
      setTwoFactorMessage({
        text: "Authenticator key copied to your clipboard.",
        type: "success"
      });
    } catch {
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

  const cardClass = "w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#303134] shadow-[0_12px_30px_rgba(0,0,0,0.22)]";
  const sectionHeaderClass = "border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(138,180,248,0.12),transparent_32%),linear-gradient(180deg,#303134_0%,#2a2b2f_100%)]";
  const inputClass = "w-full rounded-lg border border-[#5f6368] bg-[#202124] px-4 py-2.5 text-sm text-[#e8eaed] outline-none transition-colors placeholder:text-[#9aa0a6] focus:border-[#8ab4f8]";
  const dangerInputClass = "w-full rounded-lg border border-rose-400/20 bg-[#261b1d] px-4 py-2.5 text-sm text-rose-50 outline-none transition-colors placeholder:text-rose-200/60 focus:border-[#f28b82]";
  const neutralButtonClass = "inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#202124] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:text-[#8ab4f8] disabled:opacity-60";
  const primaryButtonClass = "inline-flex items-center justify-center rounded-xl border border-[#8ab4f8] bg-[#8ab4f8] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#202124] transition-colors hover:bg-[#9fc1fa] disabled:opacity-60";

  if (isLoadingOverview) {
    return (
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#303134] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:p-6">
        <div className="flex items-center text-sm text-[#9aa0a6]">
          <Loader2 size={16} className="mr-2 animate-spin" />
          Loading security settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className={cardClass}>
        <div className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${sectionHeaderClass}`}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8ab4f8]/15 text-[#8ab4f8]">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8eaed]">Security Center</h3>
              <p className="text-xs text-[#9aa0a6]">Manage sign-in methods, 2FA, sessions, and account deletion.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadSecurityOverview()}
            disabled={isRefreshingOverview}
            className={`w-full sm:w-auto ${neutralButtonClass}`}
          >
            {isRefreshingOverview ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
            Refresh
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {overviewError && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-100">
              {overviewError}
            </div>
          )}
          <div className="grid gap-4 min-[360px]:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#202124] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9aa0a6]">Password</p>
              <p className="mt-2 text-lg font-bold text-[#e8eaed]">{securityState?.loginMethods?.password ? "Enabled" : "Not Set"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#202124] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9aa0a6]">Google</p>
              <p className="mt-2 text-lg font-bold text-[#e8eaed]">{securityState?.loginMethods?.google ? "Connected" : "Not Connected"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#202124] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9aa0a6]">2FA</p>
              <p className="mt-2 text-lg font-bold text-[#e8eaed]">{securityState?.twoFactor?.enabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#202124] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9aa0a6]">Sessions</p>
              <p className="mt-2 text-lg font-bold text-[#e8eaed]">{securityState?.activeSessionCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className={`flex items-start gap-3 p-4 sm:p-6 ${sectionHeaderClass}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8ab4f8]/15 text-[#8ab4f8]">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed]">{securityState?.loginMethods?.password ? "Change Password" : "Set Password"}</h3>
            <p className="text-xs text-[#9aa0a6]">
              {securityState?.loginMethods?.password
                ? "Changing it signs out your other devices and always needs your authenticator code."
                : "Create email/password access for this account after enabling the authenticator app."}
            </p>
          </div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-4 sm:p-6 space-y-4">
          <MessageBanner message={passwordMessage} />
          {!securityState?.twoFactor?.enabled && (
            <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-4">
              <p className="text-sm font-semibold text-amber-100">Authenticator setup is required first.</p>
              <p className="mt-1 text-xs text-amber-50/80">
                Password changes now use your authenticator app instead of paid OTP delivery.
              </p>
              <button
                type="button"
                onClick={scrollToTwoFactorSection}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-amber-300/20 bg-[#202124] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-100 transition-colors hover:bg-amber-400/10 sm:w-auto"
              >
                Set Up Authenticator
              </button>
            </div>
          )}
          {securityState?.loginMethods?.password && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6]">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} required />
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6]">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className={inputClass} minLength={8} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6]">Confirm Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className={inputClass} minLength={8} required />
            </div>
          </div>
          {securityState?.twoFactor?.enabled && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6]">Authenticator Code</label>
              <input type="text" inputMode="numeric" maxLength={6} value={passwordForm.totpCode} onChange={(event) => setPasswordForm((current) => ({ ...current, totpCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} className={inputClass} placeholder="123456" required />
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword || !securityState?.twoFactor?.enabled}
              className={`w-full sm:w-auto ${primaryButtonClass}`}
            >
              {isUpdatingPassword ? <Loader2 size={16} className="mr-2 animate-spin" /> : <KeyRound size={16} className="mr-2" />}
              {securityState?.loginMethods?.password ? "Update Password" : "Create Password"}
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass} id="two-factor-section">
        <div className={`flex items-start gap-3 p-4 sm:p-6 ${sectionHeaderClass}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-200">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed]">Two-Factor Authentication</h3>
            <p className="text-xs text-[#9aa0a6]">Use any TOTP app, then enter the 6-digit code on login.</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <MessageBanner message={twoFactorMessage} />
          {!securityState?.twoFactor?.enabled && !twoFactorSetup && (
            <button type="button" onClick={handleStartTwoFactorSetup} disabled={isWorkingTwoFactor} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-100 transition-colors hover:bg-emerald-500/20 disabled:opacity-60">
              {isWorkingTwoFactor ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
              Start Setup
            </button>
          )}
          {!securityState?.twoFactor?.enabled && twoFactorSetup && (
            <form onSubmit={handleConfirmTwoFactorSetup} className="space-y-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#e8eaed]">Manual Setup Key</p>
                  <p className="mt-1 text-xs text-[#bdc1c6]">Add this key to Google Authenticator, 1Password, Authy, or Microsoft Authenticator.</p>
                </div>
                <button type="button" onClick={handleCopySecret} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/10 bg-[#202124] px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:text-[#8ab4f8]">
                  <Copy size={12} className="mr-2" />
                  Copy Key
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#202124] px-4 py-3 text-sm font-semibold tracking-[0.24em] text-[#e8eaed] break-all">
                {twoFactorSetup.manualEntryKey}
              </div>
              <input type="text" inputMode="numeric" maxLength={6} value={twoFactorSetupCode} onChange={(event) => setTwoFactorSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} placeholder="123456" required />
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={isWorkingTwoFactor} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-100 transition-colors hover:bg-emerald-500/20 disabled:opacity-60">
                  {isWorkingTwoFactor ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
                  Verify and Enable
                </button>
                <button type="button" onClick={handleStartTwoFactorSetup} disabled={isWorkingTwoFactor} className={`w-full sm:w-auto ${neutralButtonClass.replace("py-2.5", "py-3")}`}>
                  Regenerate Key
                </button>
              </div>
            </form>
          )}
          {securityState?.twoFactor?.enabled && (
            <form onSubmit={handleDisableTwoFactor} className="space-y-4">
              {securityState?.loginMethods?.password && <input type="password" value={twoFactorDisableForm.currentPassword} onChange={(event) => setTwoFactorDisableForm((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} placeholder="Current password" required />}
              <input type="text" inputMode="numeric" maxLength={6} value={twoFactorDisableForm.code} onChange={(event) => setTwoFactorDisableForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, "").slice(0, 6) }))} className={inputClass} placeholder="Authenticator code" required />
              <button type="submit" disabled={isWorkingTwoFactor} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-rose-100 transition-colors hover:bg-rose-500/15 disabled:opacity-60">
                {isWorkingTwoFactor ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
                Disable Two-Factor Auth
              </button>
            </form>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className={`flex items-start gap-3 p-4 sm:p-6 ${sectionHeaderClass}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-200">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed]">Active Sessions</h3>
            <p className="text-xs text-[#9aa0a6]">Review and sign out devices you do not recognize.</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <MessageBanner message={sessionsMessage} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-[#bdc1c6]">Logging out all devices also clears saved browser reminder subscriptions.</p>
            <button type="button" onClick={handleLogoutAllSessions} disabled={isSigningOutAll} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/10 bg-[#202124] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:text-[#8ab4f8] disabled:opacity-60">
              {isSigningOutAll ? <Loader2 size={14} className="mr-2 animate-spin" /> : <LogOut size={14} className="mr-2" />}
              Logout All Devices
            </button>
          </div>
          <div className="space-y-3">
            {(securityState?.sessions || []).map((session) => (
              <div key={session.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#202124] p-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[#e8eaed]">{session.deviceLabel}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${session.isCurrent ? "bg-[#8ab4f8]/15 text-[#8ab4f8]" : "bg-white/10 text-[#bdc1c6]"}`}>{session.isCurrent ? "Current" : "Active"}</span>
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">{session.loginMethod}</span>
                  </div>
                  <p className="text-xs text-[#bdc1c6]">{session.browser} on {session.os}{session.ipAddress ? ` - ${session.ipAddress}` : ""}</p>
                  <div className="space-y-1 text-[11px] text-[#9aa0a6]">
                    <p>Last active: {formatDateTime(session.lastActiveAt)}</p>
                    <p>Signed in: {formatDateTime(session.createdAt)}</p>
                    <p>{session.twoFactorVerified ? "Passed two-factor verification" : "No two-factor verification recorded"}</p>
                  </div>
                </div>
                <button type="button" onClick={() => handleSignOutSession(session)} disabled={activeSessionAction === session.id} className={`inline-flex w-full lg:w-auto items-center justify-center rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-[0.2em] ${session.isCurrent ? "border-white/10 bg-[#2f3743] text-[#dbe7ff] hover:border-[#8ab4f8]" : "border-white/10 bg-[#202124] text-[#e8eaed] hover:border-[#8ab4f8] hover:text-[#8ab4f8]"} disabled:opacity-60`}>
                  {activeSessionAction === session.id ? <Loader2 size={14} className="mr-2 animate-spin" /> : <LogOut size={14} className="mr-2" />}
                  {session.isCurrent ? "Logout This Device" : "Sign Out Device"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl rounded-2xl border border-rose-400/20 bg-[#341f23] p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-100">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-100">Delete Account</h3>
            <p className="mt-1 text-xs text-rose-50/80">This permanently removes your profile, tasks, notifications, sessions, and reminder subscriptions.</p>
          </div>
        </div>
        <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
          <MessageBanner message={deleteMessage} />
          <input type="text" value={deleteForm.confirmationText} onChange={(event) => setDeleteForm((current) => ({ ...current, confirmationText: event.target.value }))} placeholder={user?.email || "name@example.com"} className={dangerInputClass} required />
          {securityState?.loginMethods?.password && <input type="password" value={deleteForm.currentPassword} onChange={(event) => setDeleteForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Current password" className={dangerInputClass} required />}
          {securityState?.twoFactor?.enabled && <input type="text" inputMode="numeric" maxLength={6} value={deleteForm.totpCode} onChange={(event) => setDeleteForm((current) => ({ ...current, totpCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="Authenticator code" className={dangerInputClass} required />}
          <button type="submit" disabled={isDeletingAccount} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/15 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-rose-100 transition-colors hover:bg-rose-500/20 disabled:opacity-60">
            {isDeletingAccount ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Trash2 size={14} className="mr-2" />}
            Delete My Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettingsPanel;
