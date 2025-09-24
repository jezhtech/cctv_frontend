import { useState } from "react";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  Database,
  Camera,
  Users,
  Save,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    attendance: true,
    errors: true,
  });
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    debugMode: false,
    logLevel: "info",
  });

  const [notificationApiKeys, setNotificationApiKeys] = useState({
    whatsapp: {
      enabled: false,
      accountSid: "",
      authToken: "",
      from: "",
    },
    email: {
      enabled: false,
      apiKey: "",
      from: "",
    },
    sms: {
      enabled: false,
      accountSid: "",
      authToken: "",
      from: "",
    },
  });

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSystemSettingChange = (
    key: keyof typeof systemSettings,
    value: any,
  ) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApiKeyChange = (
    type: "whatsapp" | "email" | "sms",
    field: string,
    value: string | boolean,
  ) => {
    setNotificationApiKeys((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to backend/localStorage
    localStorage.setItem(
      "userSettings",
      JSON.stringify({
        notifications,
        systemSettings,
        notificationApiKeys,
      }),
    );
    // Show success message
  };

  const handleResetSettings = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      setNotifications({
        email: true,
        push: false,
        attendance: true,
        errors: true,
      });
      setSystemSettings({
        autoBackup: true,
        debugMode: false,
        logLevel: "info",
      });
      setNotificationApiKeys({
        whatsapp: {
          enabled: false,
          accountSid: "",
          authToken: "",
          from: "",
        },
        email: {
          enabled: false,
          apiKey: "",
          from: "",
        },
        sms: {
          enabled: false,
          accountSid: "",
          authToken: "",
          from: "",
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and system configuration
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Sun className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md border transition-colors",
                    theme === "light"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent",
                  )}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md border transition-colors",
                    theme === "dark"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent",
                  )}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </button>
                <button
                  onClick={() => handleThemeChange("system")}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md border transition-colors",
                    theme === "system"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent",
                  )}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Email Notifications
                </label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange("email")}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  notifications.email ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    notifications.email ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Push Notifications
                </label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange("push")}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  notifications.push ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    notifications.push ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Attendance Alerts</label>
                <p className="text-sm text-muted-foreground">
                  Get notified about attendance events
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange("attendance")}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  notifications.attendance ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    notifications.attendance
                      ? "translate-x-6"
                      : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Error Alerts</label>
                <p className="text-sm text-muted-foreground">
                  Get notified about system errors
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange("errors")}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  notifications.errors ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    notifications.errors ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* External Notification Settings */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">External Notifications</h2>
          </div>

          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">WhatsApp</label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via WhatsApp
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleApiKeyChange(
                      "whatsapp",
                      "enabled",
                      !notificationApiKeys.whatsapp.enabled,
                    )
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notificationApiKeys.whatsapp.enabled
                      ? "bg-primary"
                      : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notificationApiKeys.whatsapp.enabled
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              {notificationApiKeys.whatsapp.enabled && (
                <div className="space-y-2 pl-6">
                  <div>
                    <label className="text-sm font-medium">Account SID</label>
                    <input
                      type="text"
                      value={notificationApiKeys.whatsapp.accountSid}
                      onChange={(e) =>
                        handleApiKeyChange(
                          "whatsapp",
                          "accountSid",
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auth Token</label>
                    <input
                      type="text"
                      value={notificationApiKeys.whatsapp.authToken}
                      onChange={(e) =>
                        handleApiKeyChange(
                          "whatsapp",
                          "authToken",
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">From</label>
                    <input
                      type="text"
                      value={notificationApiKeys.whatsapp.from}
                      onChange={(e) =>
                        handleApiKeyChange("whatsapp", "from", e.target.value)
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via Email (SendGrid)
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleApiKeyChange(
                      "email",
                      "enabled",
                      !notificationApiKeys.email.enabled,
                    )
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notificationApiKeys.email.enabled
                      ? "bg-primary"
                      : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notificationApiKeys.email.enabled
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              {notificationApiKeys.email.enabled && (
                <div className="space-y-2 pl-6">
                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <input
                      type="text"
                      value={notificationApiKeys.email.apiKey}
                      onChange={(e) =>
                        handleApiKeyChange("email", "apiKey", e.target.value)
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">From</label>
                    <input
                      type="text"
                      value={notificationApiKeys.email.from}
                      onChange={(e) =>
                        handleApiKeyChange("email", "from", e.target.value)
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SMS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">SMS</label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleApiKeyChange(
                      "sms",
                      "enabled",
                      !notificationApiKeys.sms.enabled,
                    )
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notificationApiKeys.sms.enabled ? "bg-primary" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notificationApiKeys.sms.enabled
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              {notificationApiKeys.sms.enabled && (
                <div className="space-y-2 pl-6">
                  <div>
                    <label className="text-sm font-medium">Account SID</label>
                    <input
                      type="text"
                      value={notificationApiKeys.sms.accountSid}
                      onChange={(e) =>
                        handleApiKeyChange("sms", "accountSid", e.target.value)
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auth Token</label>
                    <input
                      type="text"
                      value={notificationApiKeys.sms.authToken}
                      onChange={(e) =>
                        handleApiKeyChange("sms", "authToken", e.target.value)
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">From</label>
                    <input
                      type="text"
                      value={notificationApiKeys.sms.from}
                      onChange={(e) =>
                        handleApiKeyChange("sms", "from", e.target.value)
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">System</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto Backup</label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data daily
                </p>
              </div>
              <button
                onClick={() =>
                  handleSystemSettingChange(
                    "autoBackup",
                    !systemSettings.autoBackup,
                  )
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  systemSettings.autoBackup ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    systemSettings.autoBackup
                      ? "translate-x-6"
                      : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Debug Mode</label>
                <p className="text-sm text-muted-foreground">
                  Enable detailed logging and debugging
                </p>
              </div>
              <button
                onClick={() =>
                  handleSystemSettingChange(
                    "debugMode",
                    !systemSettings.debugMode,
                  )
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  systemSettings.debugMode ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    systemSettings.debugMode
                      ? "translate-x-6"
                      : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">Log Level</label>
              <select
                value={systemSettings.logLevel}
                onChange={(e) =>
                  handleSystemSettingChange("logLevel", e.target.value)
                }
                className="mt-2 w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">System Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Active Cameras</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Registered Users</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Database className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">2.4GB</p>
              <p className="text-sm text-muted-foreground">Database Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={handleResetSettings}
          className="inline-flex items-center px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Default
        </button>

        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
