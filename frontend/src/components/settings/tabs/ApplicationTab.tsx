import { Check, Trash2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clearAllThreads } from "@/lib/chat/thread-store";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore, type SendKeyMode } from "@/lib/store/settings-store";

import { SegmentedControl } from "../SegmentedControl";
import { SettingCard, SettingRow } from "../SettingCard";

const SEND_KEY_VALUES: ReadonlyArray<SendKeyMode> = ["enter", "meta-enter"];

export function ApplicationTab() {
  const { t } = useTranslation();
  const sendKey = useSettingsStore((state) => state.sendKey);
  const setSendKey = useSettingsStore((state) => state.setSendKey);
  const autoSaveDrafts = useSettingsStore((state) => state.autoSaveDrafts);
  const setAutoSaveDrafts = useSettingsStore((state) => state.setAutoSaveDrafts);
  const downloadPath = useSettingsStore((state) => state.downloadPath);
  const setDownloadPath = useSettingsStore((state) => state.setDownloadPath);

  const clearAllDrafts = useChatStore((state) => state.clearAllDrafts);

  /**
   * 关闭草稿保留时清空已存草稿。
   *
   * 刻意不动输入框里**当前**已显示的文字——那可能是用户正在写的内容，
   * 清掉等于替他删草稿。切走再切回时不会再恢复（输入框初始化时会读开关）。
   */
  const handleAutoSaveDraftsChange = React.useCallback(
    (enabled: boolean) => {
      setAutoSaveDrafts(enabled);
      if (!enabled) clearAllDrafts();
    },
    [clearAllDrafts, setAutoSaveDrafts],
  );

  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    if (!cleared) return;
    const timer = setTimeout(() => setCleared(false), 2500);
    return () => clearTimeout(timer);
  }, [cleared]);

  const handleClearConversations = React.useCallback(() => {
    clearAllThreads();
    setCleared(true);
  }, []);

  const sendKeyOptions = SEND_KEY_VALUES.map((value) => ({
    value,
    label:
      value === "enter"
        ? t("settings.application.sendKey.enter")
        : t("settings.application.sendKey.metaEnter"),
  }));

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.application.sendKey.title")}
        description={t("settings.application.sendKey.description")}
      >
        <SegmentedControl
          ariaLabel={t("settings.application.sendKey.aria")}
          value={sendKey}
          options={sendKeyOptions}
          onChange={setSendKey}
        />
      </SettingCard>

      <SettingCard>
        <SettingRow
          label={t("settings.application.drafts.label")}
          description={t("settings.application.drafts.description")}
          htmlFor="auto-save-drafts"
        >
          <Switch
            id="auto-save-drafts"
            checked={autoSaveDrafts}
            onCheckedChange={handleAutoSaveDraftsChange}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard
        title={t("settings.application.download.title")}
        description={t("settings.application.download.description")}
        footnote={t("settings.application.download.footnote")}
      >
        <Label htmlFor="download-path" className="sr-only">
          {t("settings.application.download.aria")}
        </Label>
        <Input
          id="download-path"
          value={downloadPath}
          onChange={(event) => setDownloadPath(event.target.value)}
          placeholder="~/Downloads"
          className="bg-background h-8 font-mono text-xs"
        />
      </SettingCard>

      <SettingCard
        tone="danger"
        title={t("settings.application.reset.title")}
        description={t("settings.application.reset.description")}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1.5 text-xs">
              {cleared ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3.5" aria-hidden="true" />
              )}
              <span>
                {cleared
                  ? t("settings.application.reset.cleared")
                  : t("settings.application.reset.action")}
              </span>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("settings.application.reset.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.application.reset.confirmBody")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearConversations}>
                {t("settings.application.reset.confirmAction")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SettingCard>
    </div>
  );
}
