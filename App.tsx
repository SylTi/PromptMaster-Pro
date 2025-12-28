import React, { useState, useMemo } from 'react';
import { ShellType, PromptConfig, PathStyle } from './types';
import { ICONS, BASH_TEMPLATE, ZSH_TEMPLATE } from './constants';

const App: React.FC = () => {
  const [shell, setShell] = useState<ShellType>(ShellType.BASH);
  const [config, setConfig] = useState<PromptConfig & { lastTimeSim: number; branchSim: string }>({
    user: 'networkchuck',
    context: 'deb2',
    prefix: 'ms',
    showGit: true,
    isDirty: true,
    lastTimeSim: 124,
    branchSim: 'main',
    directorySim: '~/projects/coffeeproject',
    pathStyle: PathStyle.SHORT,
    wslString: '(WSL)',
    useDayMonthFormat: false,
    use12hTime: false,
    osBgColor: '#2a2a2a',
    osTextColor: '#ffffff',
    shellBgColor: '#ffffff',
    shellTextColor: '#000000',
    userBgColor: '#fbdf5d',
    userTextColor: '#000000',
    directoryBgColor: '#111111',
    directoryTextColor: '#ffffff',
    timeTextColor: '#81d4ee',
    accentColor: '#89b4fa',
    promptSymbolColor: '#22c55e',
  });
  const [isCopied, setIsCopied] = useState(false);

  // Helper to convert hex to closest ANSI 256 color index
  const hexToAnsi256 = (hex: string): string => {
    if (hex === 'none') return 'none';
    if (!hex.startsWith('#')) return '232'; // default fallback
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Simple approximation for ANSI 256
    if (r === g && g === b) {
      if (r < 8) return '16';
      if (r > 248) return '231';
      return Math.round(((r - 8) / 247) * 23 + 232).toString();
    }
    
    const r6 = Math.round(r / 255 * 5);
    const g6 = Math.round(g / 255 * 5);
    const b6 = Math.round(b / 255 * 5);
    return (16 + 36 * r6 + 6 * g6 + b6).toString();
  };

  const currentAnsiColors = useMemo(() => ({
    osBg: hexToAnsi256(config.osBgColor),
    osFg: hexToAnsi256(config.osTextColor),
    shellBg: hexToAnsi256(config.shellBgColor),
    shellFg: hexToAnsi256(config.shellTextColor),
    userBg: hexToAnsi256(config.userBgColor),
    userFg: hexToAnsi256(config.userTextColor),
    dirBg: hexToAnsi256(config.directoryBgColor),
    dirFg: hexToAnsi256(config.directoryTextColor),
    timeFg: hexToAnsi256(config.timeTextColor),
    accent: hexToAnsi256(config.accentColor),
    symbol: hexToAnsi256(config.promptSymbolColor),
  }), [config]);

  const currentCode = useMemo(() => {
    return shell === ShellType.BASH 
      ? BASH_TEMPLATE(config.user, config.context, config.prefix, config.wslString, config.useDayMonthFormat, config.use12hTime, config.pathStyle, currentAnsiColors)
      : ZSH_TEMPLATE(config.user, config.context, config.prefix, config.wslString, config.useDayMonthFormat, config.use12hTime, config.pathStyle, currentAnsiColors);
  }, [shell, config, currentAnsiColors]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formattedDate = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    return config.useDayMonthFormat ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
  }, [config.useDayMonthFormat]);

  const formattedTime = useMemo(() => {
    const now = new Date();
    if (config.use12hTime) {
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds} ${ampm}`;
    } else {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  }, [config.use12hTime]);

  const simulatedPathDisplay = useMemo(() => {
    if (config.pathStyle === PathStyle.TAIL) {
      return config.directorySim.split('/').pop() || '/';
    }
    if (config.pathStyle === PathStyle.FULL) {
      return config.directorySim.replace('~', '/home/' + config.user);
    }
    return config.directorySim;
  }, [config.directorySim, config.pathStyle, config.user]);

  const getPreviewBg = (col: string) => col === 'none' ? 'transparent' : col;

  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="flex flex-col gap-1 w-full pb-3 border-b border-slate-700/30 last:border-0">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs"
        />
        {value !== 'none' && (
          <input 
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto font-sans">
      <header className="w-full mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          PromptMaster Pro
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Ultimate multi-line terminal prompt. Fully customizable colors, dynamic execution timing, and status-aware Git integration.
        </p>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Configuration */}
        <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="p-2 bg-blue-500/20 rounded-lg">⚙️</span>
            Customize Prompt
          </h2>
          
          <div className="space-y-6">
            {/* Shell Selection */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-400 mb-2">Target Shell</label>
              <div className="flex gap-2">
                {[ShellType.BASH, ShellType.ZSH].map((s) => (
                  <button
                    key={s}
                    onClick={() => setShell(s)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      shell === s 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dateOrder"
                    checked={config.useDayMonthFormat}
                    onChange={(e) => setConfig({ ...config, useDayMonthFormat: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="dateOrder" className="text-xs font-medium text-slate-300">DD/MM/YY format</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="time12"
                    checked={config.use12hTime}
                    onChange={(e) => setConfig({ ...config, use12hTime: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="time12" className="text-xs font-medium text-slate-300">12h Time (AM/PM)</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preview User</label>
                  <input
                    type="text"
                    value={config.user}
                    onChange={(e) => setConfig({ ...config, user: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preview Group</label>
                  <input
                    type="text"
                    value={config.context}
                    onChange={(e) => setConfig({ ...config, context: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Environment Settings */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">OS String</label>
                  <input
                    type="text"
                    value={config.wslString}
                    onChange={(e) => setConfig({ ...config, wslString: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time Suffix</label>
                  <input
                    type="text"
                    value={config.prefix}
                    onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Path Style (How path is gotten)</label>
                <div className="flex gap-2">
                  {[PathStyle.SHORT, PathStyle.FULL, PathStyle.TAIL].map((p) => (
                    <button
                      key={p}
                      onClick={() => setConfig({ ...config, pathStyle: p })}
                      className={`flex-1 py-1 text-[10px] rounded transition-all ${
                        config.pathStyle === p 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Simulated Path</label>
                <input
                  type="text"
                  value={config.directorySim}
                  onChange={(e) => setConfig({ ...config, directorySim: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            {/* Git Settings */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="git"
                    checked={config.showGit}
                    onChange={(e) => setConfig({ ...config, showGit: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="git" className="text-xs font-medium text-slate-300">Git Directory</label>
                </div>
                {config.showGit && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dirty"
                      checked={config.isDirty}
                      onChange={(e) => setConfig({ ...config, isDirty: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="dirty" className="text-xs font-medium text-slate-300">Is Dirty</label>
                  </div>
                )}
              </div>
              {config.showGit && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch</label>
                  <input
                    type="text"
                    value={config.branchSim}
                    onChange={(e) => setConfig({ ...config, branchSim: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* COLOR CONFIGURATION */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 space-y-2">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Color Palette</h3>
              
              <ColorInput label="OS Segment Background" value={config.osBgColor} onChange={(val) => setConfig({ ...config, osBgColor: val })} />
              <ColorInput label="OS Segment Text" value={config.osTextColor} onChange={(val) => setConfig({ ...config, osTextColor: val })} />
              
              <ColorInput label="Shell Segment Background" value={config.shellBgColor} onChange={(val) => setConfig({ ...config, shellBgColor: val })} />
              <ColorInput label="Shell Segment Text" value={config.shellTextColor} onChange={(val) => setConfig({ ...config, shellTextColor: val })} />
              
              <ColorInput label="User Segment Background" value={config.userBgColor} onChange={(val) => setConfig({ ...config, userBgColor: val })} />
              <ColorInput label="User Segment Text" value={config.userTextColor} onChange={(val) => setConfig({ ...config, userTextColor: val })} />
              
              <ColorInput label="MS & Time Text Color" value={config.timeTextColor} onChange={(val) => setConfig({ ...config, timeTextColor: val })} />
              
              <ColorInput label="Directory Background" value={config.directoryBgColor} onChange={(val) => setConfig({ ...config, directoryBgColor: val })} />
              <ColorInput label="Directory Path Text" value={config.directoryTextColor} onChange={(val) => setConfig({ ...config, directoryTextColor: val })} />
              <ColorInput label="Accent / Symbols Color" value={config.accentColor} onChange={(val) => setConfig({ ...config, accentColor: val })} />
              <ColorInput label="Prompt Symbol Color (>)" value={config.promptSymbolColor} onChange={(val) => setConfig({ ...config, promptSymbolColor: val })} />
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col gap-6 sticky top-8">
          <div className="bg-[#1e1e2e] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="bg-[#2d2d3d] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs text-slate-400 font-medium ml-2 uppercase tracking-tighter">Terminal Live View</span>
            </div>
            
            <div className="p-6 mono text-sm min-h-[250px] leading-relaxed select-none overflow-x-auto">
              {/* Row 1 */}
              <div className="flex mb-2 items-stretch h-7 w-fit">
                <div className="px-3 flex items-center gap-1.5 whitespace-nowrap" style={{ backgroundColor: getPreviewBg(config.osBgColor), color: config.osTextColor }}>
                  <span style={{ color: config.osTextColor }}>{ICONS.ubuntu}</span> {config.wslString}
                </div>
                <div className="px-3 flex items-center gap-1.5 whitespace-nowrap" style={{ backgroundColor: getPreviewBg(config.shellBgColor), color: config.shellTextColor }}>
                  {ICONS.terminal} {shell}
                </div>
                <div className="px-3 flex items-center gap-1.5 whitespace-nowrap font-bold" style={{ backgroundColor: getPreviewBg(config.userBgColor), color: config.userTextColor }}>
                  {ICONS.user} {config.user} / {config.context}
                </div>
              </div>
              
              {/* Row 2 */}
              <div className="mb-2 font-medium whitespace-nowrap" style={{ color: config.timeTextColor }}>
                {config.lastTimeSim}ms {config.prefix} • {formattedDate} {formattedTime}
              </div>
              
              {/* Row 3 - Path Segment */}
              <div className="flex items-center w-fit">
                <div className="flex items-stretch max-w-full">
                   <svg width="12" height="28" viewBox="0 0 12 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" style={{ color: getPreviewBg(config.directoryBgColor) }}>
                     <path d="M12 0C5.37258 0 0 6.26801 0 14C0 21.732 5.37258 28 12 28V0Z" fill="currentColor"/>
                   </svg>
                   
                   <div className="px-1 flex items-center gap-1 font-bold h-[28px] overflow-hidden" style={{ backgroundColor: getPreviewBg(config.directoryBgColor) }}>
                    <span className="mr-0.5" style={{ color: config.accentColor }}>[</span>
                    <span className="shrink-0" style={{ color: config.accentColor }}>{ICONS.home}</span> 
                    <span className="mx-1" style={{ color: config.accentColor }}>»</span> 
                    <span className="truncate" style={{ color: config.directoryTextColor }}>{simulatedPathDisplay}</span>
                    {config.showGit && (
                      <span className="flex items-center gap-1.5 ml-1 shrink-0">
                        <span className={`${config.isDirty ? 'text-red-500' : 'text-green-500'} font-black text-lg leading-none`}>*</span> 
                        <span className="opacity-90" style={{ color: config.directoryTextColor }}>{config.branchSim}</span>
                      </span>
                    )}
                    <span className="ml-0.5" style={{ color: config.accentColor }}>]</span>
                   </div>

                   <svg width="12" height="28" viewBox="0 0 12 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" style={{ color: getPreviewBg(config.directoryBgColor) }}>
                     <path d="M0 0C6.62742 0 12 6.26801 12 14C12 21.732 6.62742 28 0 28V0Z" fill="currentColor"/>
                   </svg>
                </div>
              </div>

              {/* Row 4 - Prompt Symbol */}
              <div className="flex items-center mt-1">
                <span className="font-bold text-lg" style={{ color: config.promptSymbolColor }}>&gt;</span>
                <span className="ml-2 animate-pulse w-2 h-5 bg-white opacity-60"></span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <button
              onClick={handleCopy}
              className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-all ${
                isCopied ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isCopied ? 'Copied Code!' : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">Copy Config</span>
                </div>
              )}
            </button>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 overflow-x-auto max-h-[400px]">
              <pre className="mono text-[13px] text-blue-300 whitespace-pre">
                <code>{currentCode}</code>
              </pre>
            </div>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
             <div className="text-xl">🛠️</div>
             <p className="text-sm text-emerald-200 leading-relaxed">
              <strong>True Path Integration:</strong> The generator uses native shell escape sequences (<code>\w</code>, <code>%~</code>, etc.) to fetch your directory automatically. Choose your preferred <strong>Path Style</strong> above.
             </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 border-t border-slate-800 w-full text-slate-500 text-sm flex flex-col items-center gap-2">
        <p>© 2024 PromptMaster Pro. Built for modern developers.</p>
        <div className="flex gap-6 mt-2">
          <a href="https://www.nerdfonts.com/" className="hover:text-blue-400 transition-colors">Nerd Fonts</a>
        </div>
      </footer>
    </div>
  );
};

export default App;