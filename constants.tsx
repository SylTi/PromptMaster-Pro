import React from 'react';
import { PathStyle } from './types';

export const ICONS = {
  ubuntu: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 11c0-1.1-.9-2-2-2-1.1 0-2 .9-2 2s.9 2 2 2c1.1 0 2-.9 2-2zM12 2.5a1 1 0 0 0-1 1c0 .55.45 1 1 1s1-.45 1-1c0-.55-.45-1-1-1zm0 17c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM4.55 11c0-1.1-.9-2-2-2-1.1 0-2 .9-2 2s.9 2 2 2c1.1 0 2-.9 2-2zm2.12-6.36c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zm10.66 0c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zM5.26 17.26c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zm13.48 0c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>,
  terminal: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20,19V7H4V19H20M20,3A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5C2,3.89 2.89,3 4,3H20M13,17V15H18V17H13M9.58,13L5.57,9L6.96,7.58L12.38,13L6.96,18.42L5.57,17L9.58,13Z"/></svg>,
  user: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/></svg>,
  home: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/></svg>,
};

const getBashBg = (ansi: string | 'none') => ansi === 'none' ? '' : `\\[\\e[48;5;${ansi}m\\]`;
const getBashFg = (ansi: string | 'none') => ansi === 'none' ? '' : `\\[\\e[38;5;${ansi}m\\]`;

const getZshBg = (ansi: string | 'none') => ansi === 'none' ? '%k' : `%K{${ansi}}`;
const getZshFg = (ansi: string | 'none') => ansi === 'none' ? '%f' : `%F{${ansi}}`;

export const BASH_TEMPLATE = (
  userName: string, 
  userGroup: string, 
  prefix: string, 
  wslString: string, 
  useDayMonth: boolean, 
  use12h: boolean, 
  pathStyle: PathStyle,
  showGroup: boolean,
  invertUserGroup: boolean,
  colors: { osBg: string, osFg: string, shellBg: string, shellFg: string, userBg: string, userFg: string, dirBg: string, dirFg: string, timeFg: string, accent: string, symbol: string }
) => {
  const dateFormat = useDayMonth ? '%d/%m/%y' : '%m/%d/%y';
  const timeFormat = use12h ? '\\@' : '\\t';
  const bashPath = pathStyle === PathStyle.FULL ? '$(pwd)' : (pathStyle === PathStyle.TAIL ? '\\W' : '\\w');
  
  let userGroupString = "\\u";
  if (showGroup) {
    if (invertUserGroup) {
      userGroupString = "\$(id -gn) / \\u";
    } else {
      userGroupString = "\\u / \$(id -gn)";
    }
  }

  return `# NetworkChuck Inspired Prompt for BASH
# Add this to your ~/.bashrc

function get_git_status() {
    if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        local branch=$(git branch --show-current)
        if [[ -n $(git status --porcelain) ]]; then
            echo -e " \\001\\e[31m\\002*\\001\\e[0m\\002 \${branch}"
        else
            echo -e " \\001\\e[32m\\002*\\001\\e[0m\\002 \${branch}"
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

    # Line 1
    PS1="\${OS_SEG}  ${wslString} \${SHELL_SEG}  bash \${USER_SEG}  ${userGroupString} \${RESET}\\n"
    # Line 2
    PS1+="\${TIME_FG}\${last_exec_ms}ms ${prefix} • \\D{${dateFormat}} ${timeFormat}\${RESET}\\n"
    # Line 3
    PS1+="\${ACCENT_FG}\${DIR_SEG}\${ACCENT_FG}[ \${ACCENT_FG} » \${DIR_FG}${bashPath}\${GIT_STATUS} \${ACCENT_FG}]\${DIR_SEG}\${ACCENT_FG}\${RESET}\\n"
    # Line 4
    PS1+="\${SYMBOL_FG}> \${RESET}"
}

PROMPT_COMMAND=build_prompt
`;
};

export const ZSH_TEMPLATE = (
  userName: string, 
  userGroup: string, 
  prefix: string, 
  wslString: string, 
  useDayMonth: boolean, 
  use12h: boolean, 
  pathStyle: PathStyle,
  showGroup: boolean,
  invertUserGroup: boolean,
  colors: { osBg: string, osFg: string, shellBg: string, shellFg: string, userBg: string, userFg: string, dirBg: string, dirFg: string, timeFg: string, accent: string, symbol: string }
) => {
  const dateFormat = useDayMonth ? '%d/%m/%y' : '%m/%d/%y';
  const timeFormat = use12h ? '%r' : '%T';
  const zshPath = pathStyle === PathStyle.FULL ? '%d' : (pathStyle === PathStyle.TAIL ? '%c' : '%~');
  
  let userGroupString = "%n";
  if (showGroup) {
    if (invertUserGroup) {
      userGroupString = "$(id -gn) / %n";
    } else {
      userGroupString = "%n / $(id -gn)";
    }
  }

  return `# NetworkChuck Inspired Prompt for ZSH
# Add this to your ~/.zshrc

function get_git_status() {
    local branch=$(git branch --show-current 2>/dev/null)
    if [[ -n $branch ]]; then
        if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
            echo " %F{red}*%f $branch"
        else
            echo " %F{green}*%f $branch"
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

    PROMPT="\${OS_SEG}  ${wslString} \${SHELL_SEG}  zsh \${USER_SEG}  ${userGroupString} \${RESET}"
    PROMPT+=$'\\n'
    PROMPT+="\${TIME_FG}\${last_exec_ms}ms ${prefix} • %D{${dateFormat}} ${timeFormat}\${RESET}"
    PROMPT+=$'\\n'
    PROMPT+="\${ACCENT_FG}\${DIR_SEG}\${ACCENT_FG}[ \${ACCENT_FG} » \${DIR_FG}${zshPath}\${git_status} \${ACCENT_FG}]\${ACCENT_FG}\${RESET}"
    PROMPT+=$'\\n'
    PROMPT+="\${SYMBOL_FG}> \${RESET}"
}

precmd_functions+=( build_prompt )
`;
};