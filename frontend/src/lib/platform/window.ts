import { SystemService } from "../../../bindings/starter";
import { reportCapabilityFailure } from "./env";

/**
 * 把设置项落到真实窗口行为。
 *
 * 这一层只做「调用 + 失败上报」，状态真相仍在 settings-store，
 * 所以每个函数都必须幂等——设置面板可以反复切换。
 */

export async function syncAlwaysOnTop(enabled: boolean): Promise<void> {
  try {
    await SystemService.SetAlwaysOnTop(enabled);
  } catch (error) {
    reportCapabilityFailure("window:always-on-top", error);
  }
}

export async function syncLaunchOnStartup(enabled: boolean): Promise<void> {
  try {
    await SystemService.SetLaunchOnStartup(enabled);
  } catch (error) {
    reportCapabilityFailure("window:launch-on-startup", error);
  }
}

/** 返回「取消关闭到托盘」的清理函数，供 React effect 卸载时还原 */
export async function setupCloseToTray(enabled: boolean): Promise<() => void> {
  try {
    await SystemService.SetCloseToTray(enabled);
  } catch (error) {
    reportCapabilityFailure("window:close-to-tray", error);
  }
  return () => {
    void SystemService.SetCloseToTray(false).catch((error: unknown) => {
      reportCapabilityFailure("window:close-to-tray:cleanup", error);
    });
  };
}

/** 注册系统级快捷键；返回的清理函数会注销同一把加速键 */
export async function syncGlobalShortcut(
  accelerator: string,
  enabled: boolean,
): Promise<() => Promise<void>> {
  try {
    await SystemService.SetGlobalShortcut(accelerator, enabled);
  } catch (error) {
    reportCapabilityFailure("window:global-shortcut", error);
  }
  return async () => {
    try {
      await SystemService.SetGlobalShortcut(accelerator, false);
    } catch (error) {
      reportCapabilityFailure("window:global-shortcut:cleanup", error);
    }
  };
}
