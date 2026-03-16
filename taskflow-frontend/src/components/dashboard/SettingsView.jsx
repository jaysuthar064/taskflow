import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Bell, Shield, Palette, Save, Loader2 } from "lucide-react";
import API from "../../api/axios";

const SettingsView = () => {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await API.put("/profile", { name, email, password });
      
      // Update local context if provider supports it or refresh
      if (response.data.user) {
        // Assuming your AuthContext might have a way to update user data
        // For now, we'll just show success
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

      <div className="grid gap-4">
        {[
          { title: "Notifications", icon: <Bell size={20} />, desc: "Manage how you receive alerts." },
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
