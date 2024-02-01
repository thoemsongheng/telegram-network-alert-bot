export interface hostsType {
  name: string;
  ip: string;
  isp: string;
  sid: string;
  cid: string;
  loc: string;
}

export let hosts: hostsType[] = [
  {
    ip: "8.8.8.8",
    name: "Google DNS",
    isp: "Google Domian",
    sid: "none",
    cid: "none",
    loc: "none",
  },
];
