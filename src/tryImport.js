export async function tryImport(url) {
    try {
        return require(url);
    } catch (e) {
        try {
            let mod = await import(url).then(e => e).catch(e => { });
            if (!mod) throw new Error("module not found");
            return mod;
        } catch (e) {
            return {
                Prism: {},
                js_beautify: {},
                bulkElements: {},
                emmet: {},
            };
        }
    }
}