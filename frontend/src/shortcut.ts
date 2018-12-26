interface IaddShortcutOptions {
    hotkey?: string;
    callback?: (keyDownEvent: KeyboardEvent) => any;
    scope?: HTMLElement;
}

export default function addShortcut(options: IaddShortcutOptions = {}): void {
    const defaults: IaddShortcutOptions = {
        hotkey: undefined,
        callback: undefined,
        scope: document.body
    };
    let {hotkey, callback, scope} = {
        ...defaults,
        ...options
    };
    if(hotkey && callback && scope) {
        let ctrlRequired: boolean = hotkey.includes("^");
        let shiftRequired: boolean = hotkey.includes("+");
        let altRequired: boolean = hotkey.includes("!");

        function checkModifiers(keyDownEvent: KeyboardEvent): boolean {
            if(keyDownEvent.ctrlKey !== ctrlRequired) {
                return false;
            }
            if(keyDownEvent.altKey !== altRequired) {
                return false;
            }
            if(keyDownEvent.shiftKey !== shiftRequired) {
                return false;
            }
            return true;
        }

        hotkey = hotkey.replace(/[\!\^\+]/g, "");

        scope.addEventListener("keydown", (keyDownEvent: KeyboardEvent) => {
            let key: string = keyDownEvent.key.toLowerCase();
            if(key === "control" || key === "alt" || key === "shift") {
                return;
            }
            if(checkModifiers(keyDownEvent)) {
                if(key === hotkey) {
                    keyDownEvent.preventDefault();
                    keyDownEvent.stopPropagation();
                    if(callback) {
                        callback(keyDownEvent);
                    }
                }
            }
        });
    }
}