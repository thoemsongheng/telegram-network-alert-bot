interface Host {
  name: string;
  ip: string;
  isp?: string;
  sid?: string;
  cid?: string;
  location?: string;
}

let hosts: Host[] = [
  {
    ip: "192.168.0.1",
    name: "Router",
    isp: "none",
    sid: "none",
    cid: "none",
    location: "none",
  },

  {
    ip: "192.168.0.122",
    name: "Laptop",
    isp: "none",
    sid: "none",
    cid: "none",
    location: "none",
  },
];

export { Host, hosts };
