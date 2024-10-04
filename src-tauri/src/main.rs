// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::mpsc;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, Window};

// 触发“新建任务”的窗口停留秒数
const WAIT_COUNT: i32 = 10;
const CUR_MODE: MonitorMode = MonitorMode::TITLE;

#[derive(Clone, serde::Serialize)]
struct WindowTitle {
    title: String,
}

#[derive(Clone, serde::Serialize)]
struct WindowCount {
    title: String,
    count: i32,
}

fn pasue_monitor(sender: mpsc::Sender<String>) {
    println!("pasue_monitor");
    sender.send("pause".to_string()).unwrap();
}

fn resume_monitor(sender: mpsc::Sender<String>) {
    println!("resume_monitor");
    sender.send("resume".to_string()).unwrap();
}

fn main() {
    let system_tray = build_system_tray();

    tauri::Builder::default()
        .setup(|app| {
            let app_window = app.get_window("main").unwrap();

            let (sender, receiver) = mpsc::channel();
            let sender1 = sender.clone();
            let sender2 = sender.clone();

            app_window.listen("pause", move |_| pasue_monitor(sender1.clone()));
            app_window.listen("resume", move |_| resume_monitor(sender2.clone()));
            run_system_window_monitor(app_window, receiver);
            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::DoubleClick { .. } => {
                app.get_window("main").unwrap().show().unwrap(); // show the window
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => (),
            },
            _ => (),
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

enum CountState {
    Valid(i32),
    Invalid,
}

impl CountState {
    fn increment(&mut self) {
        match self {
            CountState::Valid(count) => {
                *count += 1;
            }
            CountState::Invalid => {}
        }
    }

    fn reset(&mut self) {
        match self {
            _ => *self = CountState::Valid(0),
        }
    }

    fn set_invalid(&mut self) {
        *self = CountState::Invalid;
    }
}

// 以HWND句柄作为任务切换的标志还是以窗口的标题作为任务切换的标志
enum MonitorMode {
    HWND,
    TITLE,
}

fn monitor_with_hwnd(app_window: Window, receiver: mpsc::Receiver<String>) {
    let get_event_name = |hwnd: HWND| {
        let window_title = hwnd.get_window_title();
        if window_title.is_empty() {
            "桌面待机".to_string()
        } else {
            window_title
        }
    };
    let send_new_task_event = |title: String| {
        app_window
            .emit("new_task", WindowTitle { title })
            .expect("发送事件失败");
    };
    let send_switch_window_event = |title: String, count: i32| {
        app_window
            .emit("switch_window", WindowCount { title, count })
            .expect("发送事件失败")
    };

    // 上一个窗口
    let mut pre_window = HWND::get_foreground_window();
    // 正在计时的窗口
    let mut focus_window = HWND::get_foreground_window();
    // 计时状态
    let mut count_state = CountState::Valid(0);

    let mut first_run = true;
    let mut pause = false;

    loop {
        std::thread::sleep(std::time::Duration::from_millis(1000));

        match receiver.try_recv() {
            Ok(msg) => {
                if msg == "pause" {
                    pause = true;
                    app_window
                        .emit(
                            "new_task",
                            WindowTitle {
                                title: "暂停中".to_string(),
                            },
                        )
                        .expect("发送事件失败");
                } else {
                    pause = false;
                }
            }
            Err(err) => match err {
                mpsc::TryRecvError::Empty => {}
                mpsc::TryRecvError::Disconnected => {
                    println!("通道失联");
                    break;
                }
            },
        }

        if pause {
            continue;
        }

        let cur_window = HWND::get_foreground_window();

        if cur_window == pre_window {
            count_state.increment();
        } else {
            count_state.reset();
            pre_window = cur_window;
        }

        match count_state {
            CountState::Valid(count) => {
                if count >= WAIT_COUNT {
                    if (cur_window != focus_window) || (first_run && cur_window == focus_window) {
                        send_new_task_event(get_event_name(cur_window));

                        if first_run {
                            first_run = false;
                        }
                    }
                    count_state.set_invalid();
                    focus_window = cur_window;
                } else {
                    if cur_window != focus_window {
                        send_switch_window_event(get_event_name(cur_window), count);
                    } else {
                        send_switch_window_event(get_event_name(cur_window), WAIT_COUNT);
                    }
                }
            }
            _ => {}
        }
    }
}

fn monitor_with_title(app_window: Window, receiver: mpsc::Receiver<String>) {
    let get_event_name = |title: &String| {
        if title.is_empty() {
            "桌面待机".to_string()
        } else {
            title.clone()
        }
    };
    let send_new_task_event = |title: String| {
        app_window
            .emit("new_task", WindowTitle { title })
            .expect("发送事件失败");
    };
    let send_switch_window_event = |title: String, count: i32| {
        app_window
            .emit("switch_window", WindowCount { title, count })
            .expect("发送事件失败")
    };

    // 上一个窗口
    let mut pre_title = HWND::get_foreground_window().get_window_title();
    // 正在计时的窗口
    let mut focus_title = HWND::get_foreground_window().get_window_title();
    // 计时状态
    let mut count_state = CountState::Valid(0);

    let mut first_run = true;
    let mut pause = false;

    loop {
        std::thread::sleep(std::time::Duration::from_millis(1000));

        match receiver.try_recv() {
            Ok(msg) => {
                if msg == "pause" {
                    pause = true;
                    app_window
                        .emit(
                            "new_task",
                            WindowTitle {
                                title: "暂停中".to_string(),
                            },
                        )
                        .expect("发送事件失败");
                } else {
                    pause = false;
                }
            }
            Err(err) => match err {
                mpsc::TryRecvError::Empty => {}
                mpsc::TryRecvError::Disconnected => {
                    println!("通道失联");
                    break;
                }
            },
        }

        if pause {
            continue;
        }

        let cur_title = HWND::get_foreground_window().get_window_title();

        if cur_title == pre_title {
            count_state.increment();
        } else {
            count_state.reset();
            pre_title = cur_title.clone();
        }

        match count_state {
            CountState::Valid(count) => {
                if count >= WAIT_COUNT {
                    if (cur_title != focus_title) || (first_run && cur_title == focus_title) {
                        send_new_task_event(get_event_name(&cur_title));

                        if first_run {
                            first_run = false;
                        }
                    }
                    count_state.set_invalid();
                    focus_title = cur_title;
                } else {
                    if cur_title != focus_title {
                        send_switch_window_event(get_event_name(&cur_title), count);
                    } else {
                        send_switch_window_event(get_event_name(&cur_title), WAIT_COUNT);
                    }
                }
            }
            _ => {}
        }
    }
}

fn run_system_window_monitor(app_window: Window, receiver: mpsc::Receiver<String>) {
    std::thread::spawn(move || match CUR_MODE {
        MonitorMode::HWND => monitor_with_hwnd(app_window, receiver),
        MonitorMode::TITLE => monitor_with_title(app_window, receiver),
    });
}

fn build_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW};

trait WindowObjAction {
    fn get_foreground_window() -> Self;
    fn get_window_title(&self) -> String;
}

impl WindowObjAction for HWND {
    fn get_foreground_window() -> Self {
        unsafe { GetForegroundWindow() }
    }

    fn get_window_title(&self) -> String {
        let mut buffer = [0; 256];
        let code = unsafe { GetWindowTextW(*self, &mut buffer) };
        match code {
            0 => String::new(),
            _ => String::from_utf16_lossy(&buffer)
                .trim_end_matches("\u{0000}")
                .to_string(),
        }
    }
}
