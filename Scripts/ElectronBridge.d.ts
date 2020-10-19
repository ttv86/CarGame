declare namespace electronBridge {
    function fetch(file: string): Promise<ArrayBuffer>;
}