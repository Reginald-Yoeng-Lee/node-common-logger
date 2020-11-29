import LogLevel from "./LogLevel";

export default interface LogStrategy {

    log?(level: LogLevel, msg: string, err?: Error): void;

    verbose(msg: string): void;

    debug(msg: string): void;

    info(msg: string): void;

    warn(msg: string, err?: Error): void;

    error(msg: string, err?: Error): void;

    fatal(msg: string, err?: Error): void;
}