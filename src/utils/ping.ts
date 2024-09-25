import { exec } from "child_process";

type ResponseType = {
  host: string;
  alive: boolean;
  output: string;
};

/**
 * @param {string} host - Host ip address
 * @returns {Object} - Return output object
 */

/**
 * ping cmd func: ping once and close.
 * use timing func to ping multiple time prevent keep pinging on background causing perfomance issue.
 */

const ping = (host: string) => {
  return new Promise((resolve: (result: ResponseType) => void, reject) => {
    //  Number of echo requests to send.
    var echo_flag = "-n";
    var echo_count = 1;

    try {
      exec(
        `ping ${host} ${echo_flag} ${echo_count} -l 100`,
        (err, stdout, _) => {
          // process output
          let outstring = stdout.toString();
          let byteIndex = outstring.indexOf("Reply from");

          let result: ResponseType;
          if (
            byteIndex > 0 &&
            outstring
              .substring(byteIndex)
              .toLocaleLowerCase()
              .indexOf("bytes") > 0
          ) {
            result = {
              host: host,
              alive: true,
              output: outstring,
            };
          } else {
            result = { host: host, alive: false, output: outstring };
          }
          resolve(result);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

export { ping, ResponseType };
