// import { exec } from "node:child_process";
// import { hostsType } from "../hosts";

// const hosts = [{ ip: "192.168.0.1", isp: "", name: "Office" }];
// const promise: any = [];

// const testPing = () => {
//   hosts.forEach((host) => {
//     promise.push(
//       new Promise((resolve, reject) => {
//         exec(`ping ${host.ip}`, (err, stdout, stderr) => {
//           if (err) {
//             console.log(err.message);
//             return;
//           }
//           resolve({ date: new Date(), output: stdout });
//         });
//       })
//     );
//   });
// };

// Promise.all(promise).then((results) => {
//   console.log(results);
// });

// export { testPing };
