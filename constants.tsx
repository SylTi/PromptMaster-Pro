import React from 'react';
import { PathStyle } from './types';

// Literal UTF-8 Icons for the terminal config.
// These are the actual characters from Nerd Fonts.
export const ICONS = {
  ubuntu: '',
  terminal: '',
  user: '',
  home: '',
  git: '',
  leftCap: '',
  rightCap: '',
};

const getBashBg = (ansi: string | 'none') => ansi === 'none' ? '' : `\\[\\e[48;5;${ansi}m\\]`;
const getBashFg = (ansi: string | 'none') => ansi === 'none' ? '' : `\\[\\e[38;5;${ansi}m\\]`;

const getZshBg = (ansi: string | 'none') => ansi === 'none' ? '%k' : `%K{${ansi}}`;
const getZshFg = (ansi: string | 'none') => ansi === 'none' ? '%f' : `%F{${ansi}}`;

export const BASH_TEMPLATE = (
  userName: string, 
  userGroup: string, 
  wslString: string, 
  useDayMonth: boolean, 
  use12h: boolean, 
  pathStyle: PathStyle,
  showGroup: boolean,
  invertUserGroup: boolean,
  showIcons: boolean,
  colors: { osBg: string, osFg: string, shellBg: string, shellFg: string, userBg: string, userFg: string, dirBg: string, dirFg: string, timeFg: string, accent: string, symbol: string }
) => {
  const dateFormat = useDayMonth ? '%d/%m/%y' : '%m/%d/%y';
  const timeFormat = use12h ? '\\@' : '\\t';
  const bashPath = pathStyle === PathStyle.FULL ? '$(pwd)' : (pathStyle === PathStyle.TAIL ? '\\W' : '\\w');
  
  const i = (glyph: string) => showIcons ? glyph : '';

  let userGroupString = "\\u";
  if (showGroup) {
    if (invertUserGroup) {
      userGroupString = "\$(id -gn) / \\u";
    } else {
      userGroupString = "\\u / \$(id -gn)";
    }
  }

  const isNoBg = colors.dirBg === 'none';
  const capFg = isNoBg ? '' : `\\[\\e[38;5;${colors.dirBg}m\\]`;
  const leftCap = isNoBg ? '' : `${capFg}${i(ICONS.leftCap)}`;
  const rightCap = isNoBg ? '' : `${capFg}${i(ICONS.rightCap)}`;

  return `# PromptMaster Pro Config for BASH
# Requirements: Nerd Fonts (e.g., FiraCode NF) selected in terminal settings.
# Add this to your ~/.bashrc

function get_git_status() {
    if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        local branch=$(git branch --show-current)
        local git_icon="${i(ICONS.git)}"
        if [[ -n $(git status --porcelain) ]]; then
            echo -e " \\001\\e[31m\\002*\\001\\e[0m\\002 \${git_icon} \${branch}"
        else
            echo -e " \\001\\e[32m\\002*\\001\\e[0m\\002 \${git_icon} \${branch}"
        fi
    fi
}

function timer_start {
  timer=\${timer:-$(date +%s%N)}
}

function timer_stop {
  local delta_nanos=$(($(date +%s%N) - timer))
  last_exec_ms=$((delta_nanos / 1000000))
  unset timer
}

trap 'timer_start' DEBUG

function build_prompt() {
    timer_stop
    
    local OS_SEG="${getBashBg(colors.osBg)}${getBashFg(colors.osFg)}"
    local SHELL_SEG="${getBashBg(colors.shellBg)}${getBashFg(colors.shellFg)}"
    local USER_SEG="${getBashBg(colors.userBg)}${getBashFg(colors.userFg)}"
    local DIR_SEG="${getBashBg(colors.dirBg)}"
    local TIME_FG="${getBashFg(colors.timeFg)}"
    local ACCENT_FG="${getBashFg(colors.accent)}"
    local DIR_FG="${getBashFg(colors.dirFg)}"
    local SYMBOL_FG="${getBashFg(colors.symbol)}"
    local RESET="\\[\\e[0m\\]"
    local GIT_STATUS=$(get_git_status)

    # Line 1: Basic Segments
    PS1="\${OS_SEG} ${i(ICONS.ubuntu)} ${wslString} \${SHELL_SEG} ${i(ICONS.terminal)} bash \${USER_SEG} ${i(ICONS.user)} ${userGroupString} \${RESET}\\n"
    
    # Line 2: Timing
    PS1+="\${TIME_FG}\${last_exec_ms} ms • \\D{${dateFormat}} ${timeFormat}\${RESET}\\n"
    
    # Line 3: Path pill with Surroundings (Caps removed if no BG)
    PS1+="${leftCap}\${DIR_SEG}\${ACCENT_FG}[ \${ACCENT_FG}${i(ICONS.home)} » \${DIR_FG}${bashPath}\${GIT_STATUS} \${ACCENT_FG}]\${RESET}${rightCap}\${RESET}\\n"
    
    # Line 4: Symbol
    PS1+="\${SYMBOL_FG}> \${RESET}"
}

PROMPT_COMMAND=build_prompt
`;
};

export const ZSH_TEMPLATE = (
  userName: string, 
  userGroup: string, 
  wslString: string, 
  useDayMonth: boolean, 
  use12h: boolean, 
  pathStyle: PathStyle,
  showGroup: boolean,
  invertUserGroup: boolean,
  showIcons: boolean,
  colors: { osBg: string, osFg: string, shellBg: string, shellFg: string, userBg: string, userFg: string, dirBg: string, dirFg: string, timeFg: string, accent: string, symbol: string }
) => {
  const dateFormat = useDayMonth ? '%d/%m/%y' : '%m/%d/%y';
  const timeFormat = use12h ? '%r' : '%T';
  const zshPath = pathStyle === PathStyle.FULL ? '%d' : (pathStyle === PathStyle.TAIL ? '%c' : '%~');
  const i = (glyph: string) => showIcons ? glyph : '';

  let userGroupString = "%n";
  if (showGroup) {
    if (invertUserGroup) {
      userGroupString = "$(id -gn) / %n";
    } else {
      userGroupString = "%n / $(id -gn)";
    }
  }

  const isNoBg = colors.dirBg === 'none';
  const capFg = isNoBg ? '' : `%F{${colors.dirBg}}`;
  const leftCap = isNoBg ? '' : `${capFg}${i(ICONS.leftCap)}`;
  const rightCap = isNoBg ? '' : `${capFg}${i(ICONS.rightCap)}`;

  return `# PromptMaster Pro Config for ZSH
# Requirements: Nerd Fonts installed and active in terminal.
# Add this to your ~/.zshrc

function get_git_status() {
    local branch=$(git branch --show-current 2>/dev/null)
    if [[ -n $branch ]]; then
        local git_icon="${i(ICONS.git)}"
        if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
            echo " %F{red}*%f \${git_icon} $branch"
        else
            echo " %F{green}*%f \${git_icon} $branch"
        fi
    fi
}

zmodload zsh/datetime

function preexec() {
  timer=$EPOCHREALTIME
}

function build_prompt() {
    if [ $timer ]; then
      local now=$EPOCHREALTIME
      local elapsed=$((now - timer))
      last_exec_ms=$(printf "%.0f" $((elapsed * 1000)))
      unset timer
    else
      last_exec_ms=0
    fi

    local OS_SEG="${getZshBg(colors.osBg)}${getZshFg(colors.osFg)}"
    local SHELL_SEG="${getZshBg(colors.shellBg)}${getZshFg(colors.shellFg)}"
    local USER_SEG="${getZshBg(colors.userBg)}${getZshFg(colors.userFg)}"
    local DIR_SEG="${getZshBg(colors.dirBg)}"
    local TIME_FG="${getZshFg(colors.timeFg)}"
    local ACCENT_FG="${getZshFg(colors.accent)}"
    local DIR_FG="${getZshFg(colors.dirFg)}"
    local SYMBOL_FG="${getZshFg(colors.symbol)}"
    local RESET="%k%f"
    
    local git_status=$(get_git_status)

    PROMPT="\${OS_SEG} ${i(ICONS.ubuntu)} ${wslString} \${SHELL_SEG} ${i(ICONS.terminal)} zsh \${USER_SEG} ${i(ICONS.user)} ${userGroupString} \${RESET}"
    PROMPT+=$'\\n'
    PROMPT+="\${TIME_FG}\${last_exec_ms} ms • %D{${dateFormat}} ${timeFormat}\${RESET}"
    PROMPT+=$'\\n'
    PROMPT+="${leftCap}\${DIR_SEG}\${ACCENT_FG}[ \${ACCENT_FG}${i(ICONS.home)} » \${DIR_FG}${zshPath}\${git_status} \${ACCENT_FG}]\${RESET}${rightCap}\${RESET}"
    PROMPT+=$'\\n'
    PROMPT+="\${SYMBOL_FG}> \${RESET}"
}

precmd_functions+=( build_prompt )
`;
};