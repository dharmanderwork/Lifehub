"use client";

import { useState } from "react";

export function DevUtilities() {
  // 1. JSON
  const [jsonInput, setJsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  // 2. Base64
  const [b64Input, setB64Input] = useState("");
  const [b64Output, setB64Output] = useState("");
  // 3. URL
  const [urlInput, setUrlInput] = useState("");
  const [urlOutput, setUrlOutput] = useState("");
  // 4. Timestamp
  const [timeInput, setTimeInput] = useState("");
  const [timeOutput, setTimeOutput] = useState("");
  // 5. UUID
  const [uuidOutput, setUuidOutput] = useState("");
  // 6. Regex
  const [regexPat, setRegexPat] = useState("");
  const [regexText, setRegexText] = useState("");
  const [regexOutput, setRegexOutput] = useState("");
  // 7. Text counter
  const [textCount, setTextCount] = useState("");
  // 8. JWT
  const [jwtInput, setJwtInput] = useState("");
  const [jwtHeader, setJwtHeader] = useState("");
  const [jwtPayload, setJwtPayload] = useState("");

  const formatJSON = () => {
    try {
      setJsonOutput(JSON.stringify(JSON.parse(jsonInput), null, 2));
    } catch (e: any) {
      setJsonOutput("Invalid JSON: " + e.message);
    }
  };

  const decodeJWT = () => {
    try {
      const parts = jwtInput.split(".");
      if (parts.length < 2) return;
      setJwtHeader(JSON.stringify(JSON.parse(atob(parts[0])), null, 2));
      setJwtPayload(JSON.stringify(JSON.parse(atob(parts[1])), null, 2));
    } catch (e: any) {
      setJwtHeader("Decode error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 flex items-center gap-2">
        <span>🔒 100% Client-Side Sandbox</span>
        <span>All utilities execute strictly in your browser. No sensitive tokens or data leave your machine.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. JSON Formatter */}
        <div className="bg-card border border-border p-4 rounded-xl">
          <h4 className="text-sm font-bold mb-2">1. JSON Formatter / Validator</h4>
          <textarea
            className="w-full h-24 bg-surface border border-border p-2 rounded text-xs font-mono mb-2"
            placeholder="Paste JSON..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <button onClick={formatJSON} className="bg-primary text-white text-xs px-3 py-1.5 rounded mr-2">
            Pretty Print
          </button>
          {jsonOutput && <pre className="mt-2 text-xs font-mono bg-surface p-2 rounded max-h-32 overflow-auto">{jsonOutput}</pre>}
        </div>

        {/* 2. Base64 */}
        <div className="bg-card border border-border p-4 rounded-xl">
          <h4 className="text-sm font-bold mb-2">2. Base64 Encode / Decode</h4>
          <textarea
            className="w-full h-24 bg-surface border border-border p-2 rounded text-xs font-mono mb-2"
            placeholder="Input string..."
            value={b64Input}
            onChange={(e) => setB64Input(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => setB64Output(btoa(b64Input))} className="bg-primary text-white text-xs px-3 py-1.5 rounded">
              Encode
            </button>
            <button onClick={() => { try { setB64Output(atob(b64Input)); } catch(e:any) { setB64Output("Error"); } }} className="bg-surface border border-border text-xs px-3 py-1.5 rounded">
              Decode
            </button>
          </div>
          {b64Output && <div className="mt-2 text-xs font-mono bg-surface p-2 rounded break-all">{b64Output}</div>}
        </div>

        {/* 3. UUID Generator */}
        <div className="bg-card border border-border p-4 rounded-xl">
          <h4 className="text-sm font-bold mb-2">3. UUID v4 Generator</h4>
          <button
            onClick={() => setUuidOutput(crypto.randomUUID())}
            className="bg-primary text-white text-xs px-3 py-1.5 rounded mb-2"
          >
            Generate UUID
          </button>
          {uuidOutput && <div className="text-xs font-mono bg-surface p-2 rounded break-all">{uuidOutput}</div>}
        </div>

        {/* 4. Text Counter */}
        <div className="bg-card border border-border p-4 rounded-xl">
          <h4 className="text-sm font-bold mb-2">4. Character & Word Counter</h4>
          <textarea
            className="w-full h-24 bg-surface border border-border p-2 rounded text-xs mb-2"
            placeholder="Type or paste text..."
            value={textCount}
            onChange={(e) => setTextCount(e.target.value)}
          />
          <div className="text-xs text-muted-foreground font-mono">
            Chars: {textCount.length} | Words: {textCount.trim() ? textCount.trim().split(/\s+/).length : 0} | Lines: {textCount ? textCount.split("
").length : 0}
          </div>
        </div>

        {/* 5. JWT Inspector */}
        <div className="bg-card border border-border p-4 rounded-xl md:col-span-2">
          <h4 className="text-sm font-bold mb-2">5. JWT Token Inspector (Client-side only)</h4>
          <textarea
            className="w-full h-16 bg-surface border border-border p-2 rounded text-xs font-mono mb-2"
            placeholder="Paste JWT (header.payload.signature)..."
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
          />
          <button onClick={decodeJWT} className="bg-primary text-white text-xs px-3 py-1.5 rounded mb-2">
            Decode Token
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground">HEADER:</div>
              <pre className="bg-surface p-2 rounded text-xs font-mono max-h-32 overflow-auto">{jwtHeader || "{}"}</pre>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground">PAYLOAD:</div>
              <pre className="bg-surface p-2 rounded text-xs font-mono max-h-32 overflow-auto">{jwtPayload || "{}"}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
