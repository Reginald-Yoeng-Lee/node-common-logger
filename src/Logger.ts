import LogStrategy from "./LogStrategy";
import LogLevel from "./LogLevel";

export default class Logger implements LogStrategy {

    logLevel: LogLevel;

    logStrategy: LogStrategy;

    private currentTag?: string;
    private tagSeparator?: string;
    private args?: [string, string][];

    #main = true;

    constructor(logLevel: LogLevel, logStrategy: LogStrategy) {
        this.logLevel = logLevel;
        this.logStrategy = logStrategy;
    }

    log(level: LogLevel, msg: string, err?: Error): void {
        if (!this.shouldLog(level)) {
            return;
        }
        if (this.logStrategy.log) {
            this.logStrategy.log(level, this.decorateMsg(msg), err);
        } else {
            switch (level) {
                case LogLevel.VERBOSE:
                    this.verbose(msg);
                    break;
                case LogLevel.DEBUG:
                    this.debug(msg);
                    break;
                case LogLevel.INFO:
                    this.info(msg);
                    break;
                case LogLevel.WARN:
                    this.warn(msg, err);
                    break;
                case LogLevel.ERROR:
                    this.error(msg, err);
                    break;
                case LogLevel.FATAL:
                    this.fatal(msg, err);
                    break;
            }
        }
    }

    verbose(msg: string): void {
        this.shouldLog(LogLevel.VERBOSE) && this.logStrategy.verbose(this.decorateMsg(msg));
    }

    debug(msg: string): void {
        this.shouldLog(LogLevel.DEBUG) && this.logStrategy.debug(this.decorateMsg(msg));
    }

    info(msg: string): void {
        this.shouldLog(LogLevel.INFO) && this.logStrategy.info(this.decorateMsg(msg));
    }

    warn(msg: string, err?: Error): void {
        this.shouldLog(LogLevel.WARN) && this.logStrategy.warn(this.decorateMsg(msg), err);
    }

    error(msg: string, err?: Error): void {
        this.shouldLog(LogLevel.ERROR) && this.logStrategy.error(this.decorateMsg(msg), err);
    }

    fatal(msg: string, err?: Error): void {
        this.shouldLog(LogLevel.FATAL) && this.logStrategy.fatal(this.decorateMsg(msg), err);
    }

    shouldLog(level: LogLevel): boolean {
        return this.logLevel >= level;
    }

    tag(tag: string, separator: string = ' - '): Logger {
        const logger = this.createSubLogger();
        logger.currentTag = tag;
        logger.tagSeparator = separator;
        return logger;
    }

    addArgument(val: string, placeholder: string = '{}'): Logger {
        const logger = this.createSubLogger();
        logger.args || (logger.args = []);
        logger.args.push([placeholder, val]);
        return logger;
    }

    private createSubLogger(): Logger {
        if (this.#main) {
            const logger = new Logger(this.logLevel, this.logStrategy);
            logger.#main = false;
            return logger;
        }
        return this;
    }

    private decorateMsg(msg: string): string {
        if (this.currentTag) {
            msg = `${this.currentTag}${this.tagSeparator || ''}${msg}`;
        }
        if (this.args) {
            for (let [placeholder, val] of this.args) {
                msg = msg.replace(placeholder, val);
            }
        }
        return msg;
    }
}