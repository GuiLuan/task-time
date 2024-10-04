use windows::Win32::{
    Foundation::HWND,
    UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW},
};

pub trait GetWindow {
    fn get_foreground_window(&self) -> HWND;
}
pub trait GetWindowTitle {
    fn get_window_title(&self) -> Option<String>;
}

impl GetWindow for HWND {
    fn get_foreground_window(&self) -> HWND {
        unsafe { GetForegroundWindow() }
    }
}
impl GetWindowTitle for HWND {
    fn get_window_title(&self) -> Option<String> {
        let mut buffer = [0u16; 256];
        let op_code = unsafe { GetWindowTextW(*self, &mut buffer) };

        match op_code {
            0 => None,
            _ => Some(
                String::from_utf16_lossy(&buffer)
                    .trim_end_matches("\u{0000}")
                    .to_string(),
            ),
        }
    }
}
