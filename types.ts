export enum ShellType {
  BASH = 'bash',
  ZSH = 'zsh'
}

export enum PathStyle {
  SHORT = 'short', // ~/path
  FULL = 'full',   // /home/user/path
  TAIL = 'tail'    // folder
}

export interface PromptConfig {
  user: string;
  context: string;
  showGit: boolean;
  isDirty: boolean;
  directorySim: string;
  pathStyle: PathStyle;
  wslString: string;
  useDayMonthFormat: boolean;
  use12hTime: boolean;
  showGroup: boolean;
  invertUserGroup: boolean;
  showIcons: boolean;
  osBgColor: string;
  osTextColor: string;
  shellBgColor: string;
  shellTextColor: string;
  userBgColor: string;
  userTextColor: string;
  directoryBgColor: string;
  directoryTextColor: string;
  timeTextColor: string;
  accentColor: string;
  promptSymbolColor: string;
}