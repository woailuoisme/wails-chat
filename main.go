package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/services/notifications"
)

// 前端构建产物，由 application.AssetFileServerFS 直接对外提供
//
//go:embed all:frontend/dist
var assets embed.FS

// main 组装服务、资源与主窗口；app.Run 阻塞到应用退出。
func main() {
	notifier := notifications.New()
	systemService := NewSystemService(notifier)

	app := application.New(application.Options{
		Name:        "Starter",
		Description: "Starter 桌面客户端",
		Icon:        appIcon,
		Services: []application.Service{
			application.NewService(systemService),
			application.NewService(notifier),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		// 二次启动直接把已有窗口叫到前面，而不是再开一个实例
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID: "com.hxg.starter",
			OnSecondInstanceLaunch: func(application.SecondInstanceData) {
				systemService.ShowWindow()
			},
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// 主窗口：内容顶到红绿灯，尺寸与最小尺寸按三栏布局定
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:            "main",
		Title:           "Starter",
		Width:           1280,
		Height:          832,
		MinWidth:        960,
		MinHeight:       600,
		InitialPosition: application.WindowCentered,
		Mac: application.MacWindow{
			// 与 frontend/src/styles/shell.css 的 --titlebar-inset 保持一致
			InvisibleTitleBarHeight: 36,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(6, 7, 15),
		URL:              "/",
	})

	// 默认菜单补齐 App/Edit/Window/Help，macOS 才有撤销、复制粘贴与 ⌘Q 菜单项
	app.Menu.SetApplicationMenu(application.DefaultApplicationMenu())

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
