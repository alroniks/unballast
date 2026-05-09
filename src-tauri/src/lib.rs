pub mod core;

use crate::core::models::{ScanConfig, ScanResult};
use crate::core::scanner;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_positioner::{Position, WindowExt};

// --- IPC Commands ---

#[tauri::command]
async fn scan_folders(config: ScanConfig) -> Result<Vec<ScanResult>, String> {
    // We use a simple unblocking approach for now. Jwalk blocks, so we run it in a spawn_blocking.
    tauri::async_runtime::spawn_blocking(move || scanner::scan_directories(&config))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn trash_folder(path: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || scanner::move_to_trash(&path))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn delete_folder(path: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || scanner::delete_permanently(&path))
        .await
        .map_err(|e| e.to_string())?
}

// --- App Entry Point ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_folders,
            trash_folder,
            delete_folder
        ])
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    if event.id.as_ref() == "quit" {
                        app.exit(0);
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window
                                .as_ref()
                                .window()
                                .move_window(Position::TrayBottomCenter);

                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // When the window loses focus, we hide it to mimic native popover behavior
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        let _ = window_clone.hide();
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
