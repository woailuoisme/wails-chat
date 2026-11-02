/**
 * 能力降级统一出口。
 *
 * 桌面壳里的失败多数是环境缺失（无权限、无 Secret Service、未签名包），
 * 只上报不抛错，避免一条旁路能力把整块 UI 打挂。
 */
export function reportCapabilityFailure(scope: string, error: unknown): void {
  console.warn(`[capability] ${scope}`, error);
}
