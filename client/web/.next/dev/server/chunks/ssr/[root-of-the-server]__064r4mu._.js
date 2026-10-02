module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/client/web/src/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function Home() {
    const WS_URI = "ws://127.0.0.1:8080";
    const PING_INTERVAL_MS = 5000;
    const output = document.querySelector("#output");
    if (!output) {
        throw new Error("#output element not found");
    }
    const websocket = new WebSocket(WS_URI);
    let pingInterval;
    function writeToScreen(message) {
        const p = document.createElement("p");
        p.textContent = message;
        output.prepend(p);
    }
    function sendMessage(message) {
        writeToScreen(`SENT: ${message}`);
        websocket.send(message);
    }
    websocket.onopen = ()=>{
        writeToScreen("CONNECTED");
        sendMessage("ping");
        pingInterval = setInterval(()=>{
            sendMessage("ping");
        }, PING_INTERVAL_MS);
    };
    websocket.onclose = ()=>{
        writeToScreen("DISCONNECTED");
        clearInterval(pingInterval);
    };
    websocket.onmessage = (e)=>{
        writeToScreen(`RECEIVED: ${e.data}`);
    };
    websocket.onerror = ()=>{
        writeToScreen(`ERROR: connection failed`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "WebSocket Test"
            }, void 0, false, {
                fileName: "[project]/client/web/src/app/page.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Ping every 5 seconds"
            }, void 0, false, {
                fileName: "[project]/client/web/src/app/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "output"
            }, void 0, false, {
                fileName: "[project]/client/web/src/app/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/client/web/src/app/page.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
}),
"[project]/client/web/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/client/web/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__064r4mu._.js.map