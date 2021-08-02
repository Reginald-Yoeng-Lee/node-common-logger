import MessageDecoration from "./MessageDecoration";
import Logger from "../Logger";
import LogLevel from "../LogLevel";

class LogLevelMessageDecoration implements MessageDecoration {

    decorate(logger: Logger, logLevel: LogLevel, msg: string): string {
        const levelName = LogLevel[logLevel];
        return `${levelName}${new Array(10 - levelName.length).fill(' ').join('')}${msg}`;
    }
}

export default LogLevelMessageDecoration;