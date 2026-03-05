use tauri::tray::TrayIconBuilder;
use tauri::image::Image;

#[tauri::command]
fn update_tray(app: tauri::AppHandle, title: String, tooltip: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main-tray") {
        tray.set_title(Some(&title)).map_err(|e| e.to_string())?;
        tray.set_tooltip(Some(&tooltip)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            let empty = Image::new_owned(vec![0, 0, 0, 0], 1, 1);
            let _tray = TrayIconBuilder::with_id("main-tray")
                .icon(empty)
                .tooltip("伦敦金银行情 - 等待数据...")
                .title("金-- 银--")
                .build(_app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_tray])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
