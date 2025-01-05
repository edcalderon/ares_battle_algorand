import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Boss = {
  id: number;
  name: string;
  health: number;
  governor: string;
  status: string
  version: string;
};

export type Contributor = { address: string; contribution: number };

export type ExplorerActionType = 'account' | 'application';