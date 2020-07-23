export type KeyBinding = "up" | "down" | "left" | "right" | "jumpOrBrake" | "enterExit" | "attack" | "nextWeapon" | "prevWeapon" | "horn";
const keyBindings: Record<KeyBinding, readonly number[]> = {
    "up": [38, 87],
    "down": [40, 83],
    "left": [37, 65],
    "right": [39, 68],
    "jumpOrBrake": [],
    "enterExit": [13],
    "attack": [],
    "nextWeapon": [],
    "prevWeapon": [],
    "horn": [],
}

export default class KeyboardHandler {
    private current = new Set<number>();
    private previous: ReadonlySet<number> = new Set<number>();

    public update() {
        this.previous = new Set<number>(this.current);
    }

    public setKeyStatus(key: number, isDown: boolean) {
        if (isDown) {
            this.current.add(key);
        } else {
            this.current.delete(key);
        }
    }

    /**
     * Whether key is currently down.
     * @param key Key code or key binding name.
     */
    public isDown(key: number | KeyBinding) {
        const codes = (typeof key === "number") ? [key] : keyBindings[key];
        return isAnyInSet(codes, this.current);
    }

    /**
     * Whether key is currently not down.
     * @param key Key code or key binding name.
     */
    public isUp(key: number | KeyBinding) {
        const codes = (typeof key === "number") ? [key] : keyBindings[key];
        return !isAnyInSet(codes, this.current);
    }

    /**
     * Whether key is pressed down since last update.
     * @param key Key code or key binding name.
     */
    public isPressed(key: number | KeyBinding) {
        const codes = (typeof key === "number") ? [key] : keyBindings[key];
        return isAnyInSet(codes, this.current) && !isAnyInSet(codes, this.previous);
    }

    /**
     * Whether key is released since last update.
     * @param key Key code or key binding name.
     */
    public isReleased(key: number | KeyBinding) {
        const codes = (typeof key === "number") ? [key] : keyBindings[key];
        return !isAnyInSet(codes, this.current) && isAnyInSet(codes, this.previous);
    }
}

function isAnyInSet(keys: readonly number[], set: ReadonlySet<number>): boolean {
    for (const key of keys) {
        if (set.has(key)) {
            return true;
        }
    }

    return false;
}