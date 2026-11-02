import { SystemService } from "../../../bindings/starter";
import { reportCapabilityFailure } from "./env";

/** 原生保存对话框 + 写盘；用户取消返回 false，不当作错误上报 */
export async function saveTextFile(
  directory: string,
  filename: string,
  content: string,
): Promise<boolean> {
  try {
    const savedPath = await SystemService.SaveTextFile(directory, filename, content);
    return Boolean(savedPath);
  } catch (error) {
    reportCapabilityFailure("fs:save-text-file", error);
    return false;
  }
}

/** 只提示不阻塞：通知失败（未授权/未签名包）不影响对话结果 */
export function notifyCompletion(title: string, body: string): void {
  void SystemService.Notify(title, body).catch((error: unknown) => {
    reportCapabilityFailure("fs:notify", error);
  });
}

/** 纯前端合成提示音，不依赖任何系统音频文件 */
export function playCompletionChime(): void {
  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
    oscillator.addEventListener("ended", () => void context.close(), { once: true });
  } catch (error) {
    // 浏览器在用户交互前会挂起 AudioContext，这里静默降级
    reportCapabilityFailure("fs:chime", error);
  }
}
