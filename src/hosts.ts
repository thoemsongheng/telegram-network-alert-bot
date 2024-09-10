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
    ip: "192.168.0.1",
    name: "Router",
    isp: "none",
    sid: "none",
    cid: "none",
    loc: "none",
  },
  {
    ip: "192.168.0.98",
    name: "Destop",
    isp: "none",
    sid: "none",
    cid: "none",
    loc: "none",
  },
  {
    ip: "192.168.0.122",
    name: "Laptop",
    isp: "none",
    sid: "none",
    cid: "none",
    loc: "none",
  },
];
