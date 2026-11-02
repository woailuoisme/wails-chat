package main

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"github.com/wailsapp/wails/v3/pkg/services/notifications"
	"github.com/zalando/go-keyring"
)

//go:embed build/appicon.png
var appIcon []byte

// 钥匙串的 service 段，用产品标识避免与其它应用撞名
const keyringService = "com.hxg.starter"

// 主窗口名，与 main.go 的 WebviewWindowOptions.Name 对应；
// 托盘、全局快捷键、单实例回调都靠它拿窗口，不能用 Current()。
const mainWindowName = "main"

// SystemService 收口全部 OS 副作用：前端只调生成的 bindings，
// 不按能力拆多个 service，避免 application.Options.Services 膨胀。
type SystemService struct {
	app      *application.App
	notifier *notifications.NotificationService
	logger   *slog.Logger

	closeToTray atomic.Bool
	closeHook   func()
	authOnce    sync.Once

	mu       sync.Mutex
	tray     *application.SystemTray
	shortcut string

	// 无 Secret Service 的桌面密钥只留内存，重启失效；需要时再加加密文件兜底
	memorySecrets map[string]string
}

func NewSystemService(notifier *notifications.NotificationService) *SystemService {
	return &SystemService{notifier: notifier, memorySecrets: map[string]string{}}
}

func (s *SystemService) ServiceName() string { return "SystemService" }

// ServiceStartup 在 app.Run 内执行，此时窗口已创建，适合挂窗口钩子。
func (s *SystemService) ServiceStartup(_ context.Context, _ application.ServiceOptions) error {
	s.app = application.Get()
	s.logger = s.app.Logger

	if win := s.window(); win != nil {
		s.closeHook = win.OnWindowEvent(events.Common.WindowClosing, func(event *application.WindowEvent) {
			if s.closeToTray.Load() {
				win.Hide()
				event.Cancel()
			}
		})
	}
	return nil
}

// ServiceShutdown 归还全局资源，否则重启会残留托盘与全局快捷键。
func (s *SystemService) ServiceShutdown() error {
	if s.closeHook != nil {
		s.closeHook()
		s.closeHook = nil
	}

	s.mu.Lock()
	shortcut, tray := s.shortcut, s.tray
	s.shortcut, s.tray = "", nil
	s.mu.Unlock()

	if shortcut != "" {
		_ = s.app.GlobalShortcut.Unregister(shortcut)
	}
	if tray != nil {
		tray.Destroy()
	}
	return nil
}

// SetCloseToTray 决定关窗是隐藏还是退出；开启时建托盘，否则用户找不回窗口。
func (s *SystemService) SetCloseToTray(enabled bool) {
	s.closeToTray.Store(enabled)
	if enabled {
		s.ensureTray()
	}
}

func (s *SystemService) ensureTray() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.tray != nil {
		return
	}

	tray := s.app.SystemTray.New()
	tray.SetIcon(appIcon)
	tray.SetTooltip("Starter")
	tray.OnClick(s.ShowWindow)

	menu := application.NewMenu()
	menu.Add("显示窗口").OnClick(func(*application.Context) { s.ShowWindow() })
	menu.AddSeparator()
	menu.Add("退出").OnClick(func(*application.Context) { s.app.Quit() })
	tray.SetMenu(menu)

	s.tray = tray
}

func (s *SystemService) ShowWindow() {
	if win := s.window(); win != nil {
		win.Show()
		win.Focus()
	}
}

// window 按名字取主窗口：Go 发起的回调没有前端上下文，
// Current() 依赖 keyWindow，窗口隐藏时可能为空。
func (s *SystemService) window() application.Window {
	if win, ok := s.app.Window.GetByName(mainWindowName); ok {
		return win
	}
	return s.app.Window.Current()
}

func (s *SystemService) SetAlwaysOnTop(enabled bool) {
	if win := s.window(); win != nil {
		win.SetAlwaysOnTop(enabled)
	}
}

func (s *SystemService) SetLaunchOnStartup(enabled bool) error {
	if enabled {
		return s.app.Autostart.Enable()
	}
	return s.app.Autostart.Disable()
}

// SetGlobalShortcut 幂等：设置面板反复切换不会重复注册同一把加速键。
func (s *SystemService) SetGlobalShortcut(accelerator string, enabled bool) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !enabled || accelerator == "" {
		if s.shortcut == "" {
			return nil
		}
		err := s.app.GlobalShortcut.Unregister(s.shortcut)
		s.shortcut = ""
		return err
	}

	if s.shortcut == accelerator && s.app.GlobalShortcut.IsRegistered(accelerator) {
		return nil
	}
	if s.shortcut != "" {
		_ = s.app.GlobalShortcut.Unregister(s.shortcut)
	}
	if err := s.app.GlobalShortcut.Register(accelerator, s.ShowWindow); err != nil {
		return err
	}
	s.shortcut = accelerator
	return nil
}

// Notify 首次发送前申请授权：SendNotification 自身不授权，未授权会被系统静默丢弃。
func (s *SystemService) Notify(title, body string) error {
	if s.notifier == nil {
		return nil
	}
	s.authOnce.Do(func() { _, _ = s.notifier.RequestNotificationAuthorization() })
	return s.notifier.SendNotification(notifications.NotificationOptions{
		ID:    fmt.Sprintf("starter-%d", time.Now().UnixNano()),
		Title: title,
		Body:  body,
	})
}

// SaveTextFile 走原生保存对话框：前端拿不到任意写盘能力，路径由用户确认。
func (s *SystemService) SaveTextFile(directory, filename, content string) (string, error) {
	options := &application.SaveFileDialogOptions{
		Filename:  filename,
		Directory: expandHome(directory),
		Window:    s.window(), // 绑定窗口后 macOS 用 sheet 而不是 app-modal
	}
	path, err := s.app.Dialog.SaveFileWithOptions(options).PromptForSingleSelection()
	if err != nil || path == "" {
		return "", err
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		return "", err
	}
	return path, nil
}

func expandHome(dir string) string {
	if !strings.HasPrefix(dir, "~") {
		return dir
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return dir
	}
	return filepath.Join(home, strings.TrimPrefix(dir, "~"))
}

// LoadSecrets 缺失条目直接跳过：钥匙串里没有某个 provider 是常态，不是错误。
func (s *SystemService) LoadSecrets(providers []string) map[string]string {
	result := make(map[string]string, len(providers))
	for _, provider := range providers {
		if value, err := keyring.Get(keyringService, provider); err == nil && value != "" {
			result[provider] = value
		}
	}

	s.mu.Lock()
	for provider, value := range s.memorySecrets {
		result[provider] = value
	}
	s.mu.Unlock()
	return result
}

// SaveSecret 空值即删除；钥匙串不可用时退化为内存保存并告警。
func (s *SystemService) SaveSecret(provider, value string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if value == "" {
		delete(s.memorySecrets, provider)
		if err := keyring.Delete(keyringService, provider); err != nil && !errors.Is(err, keyring.ErrNotFound) {
			s.log().Warn("钥匙串删除失败", "provider", provider, "error", err)
		}
		return nil
	}

	if err := keyring.Set(keyringService, provider, value); err != nil {
		s.memorySecrets[provider] = value
		s.log().Warn("钥匙串不可用，密钥仅保存在内存", "provider", provider, "error", err)
		return nil
	}
	delete(s.memorySecrets, provider)
	return nil
}

func (s *SystemService) log() *slog.Logger {
	if s.logger != nil {
		return s.logger
	}
	return slog.Default()
}
