use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use tauri::Window;
use windows::Win32::{
    Foundation::HWND,
    UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW},
};

fn window_monitor(app_window: Window, event_receiver: mpsc::Receiver<String>) {
    let mut focus_window: Option<HWND> = None;
    let mut pre_window: Option<HWND> = None;

    loop {
        match focus_window {
            None => {}
            Some(window) => {
                
            }
        }
    }
}