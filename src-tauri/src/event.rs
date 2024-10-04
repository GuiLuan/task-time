pub struct NewTaskEvent {
    title: String,
    class: String,
}

pub struct SwitchWindowEvent {
    title: String,
    class: String,
    count: u32,
}

pub struct SwitchTitleEvent {
    title: String,
    class: String,
    count: u32,
}

pub enum Event {
    NewTask(NewTaskEvent),
    SwitchWindow(SwitchWindowEvent),
    SwitchTitle(SwitchTitleEvent),
}

trait SendEvent {
    fn send(&self, &app_window: &tauri::Window) -> ();
}

impl SendEvent for NewTaskEvent {
    fn send(&self, &app_window: &tauri::Window) {
        app_window
            .emit("new_task", self)
            .expect("emit new task event failed");
    }
}

impl SendEvent for SwitchWindowEvent {
    fn send(&self, &app_window: &tauri::Window) {
        app_window
            .emit("switch_window", self)
            .expect("emit switch window event failed");
    }
}

impl SendEvent for SwitchTitleEvent {
    fn send(&self, &app_window: &tauri::Window) {
        app_window
            .emit("switch_title", self)
            .expect("emit switch title event failed");
    }
}
