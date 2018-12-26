export default function addShortcut(options = {}) {
    const defaults = {
        hotkey: undefined,
        callback: undefined,
        scope: document.body
    };
    let { hotkey, callback, scope } = Object.assign({}, defaults, options);
    if (hotkey && callback && scope) {
        let ctrlRequired = hotkey.includes("^");
        let shiftRequired = hotkey.includes("+");
        let altRequired = hotkey.includes("!");
        function checkModifiers(keyDownEvent) {
            if (keyDownEvent.ctrlKey !== ctrlRequired) {
                return false;
            }
            if (keyDownEvent.altKey !== altRequired) {
                return false;
            }
            if (keyDownEvent.shiftKey !== shiftRequired) {
                return false;
            }
            return true;
        }
        hotkey = hotkey.replace(/[\!\^\+]/g, "");
        scope.addEventListener("keydown", (keyDownEvent) => {
            let key = keyDownEvent.key.toLowerCase();
            if (key === "control" || key === "alt" || key === "shift") {
                return;
            }
            if (checkModifiers(keyDownEvent)) {
                if (key === hotkey) {
                    keyDownEvent.preventDefault();
                    keyDownEvent.stopPropagation();
                    if (callback) {
                        callback(keyDownEvent);
                    }
                }
            }
        });
    }
}
