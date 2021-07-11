import LogStrategy from "./LogStrategy";
import LogLevel from "../LogLevel";

export default class DefaultLogStrategy implements LogStrategy {

    log(level: LogLevel, msg: string, err?: Error): void {
        if (level <= LogLevel.ERROR) {
            console.error(msg, err || '');
        } else if (level === LogLevel.WARN) {
            console.warn(msg, err || '');
        } else if (level === LogLevel.INFO) {
            console.info(msg);
        } else {
            console.debug(msg);
        }
    }

    category(name: string): LogStrategy {
        return this;
    }

    verbose(msg: string): void {
        this.log(LogLevel.VERBOSE, msg);
    }

    debug(msg: string): void {
        this.log(LogLevel.DEBUG, msg);
    }

    info(msg: string): void {
        this.log(LogLevel.INFO, msg);
    }

    warn(msg: string, err?: Error): void {
        this.log(LogLevel.WARN, msg, err);
    }

    error(msg: string, err?: Error): void {
        this.log(LogLevel.ERROR, msg, err);
    }

    fatal(msg: string, err?: Error): void {
        this.log(LogLevel.FATAL, msg, err);
    }
}