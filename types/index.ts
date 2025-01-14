import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Boss = {
  id: number;
  name: string;
  health: any;
  maxHealth: any;
  governor: any;
  status: any;
  pool: any;
  version: any;
  contributors: Contributor[];
};

export type Contributor = { address: string; contribution: number };

export type ExplorerActionType = 'account' | 'application' | 'accounts' | 'applications' | 'applicationsBox';