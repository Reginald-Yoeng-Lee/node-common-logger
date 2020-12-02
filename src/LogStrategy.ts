import LogLevel from "./LogLevel";

export default interface LogStrategy {

    /**
     * Fetch a specific named category. The category definition may be different among different LogStrategy. It could be
     * represented by different log files, different directories, or just the same thing in spite of the different names.
     * The returned LogStrategy may be totally a new object or just the current one. Notice that the returned LogStrategy
     * could be probably cached for reusing.
     *
     * @param name The expected category name.
     * @return A new LogStrategy object for the category, or just <code>this</code> if different categories are NOT supported.
     */
    category(name: string): LogStrategy;

    log?(level: LogLevel, msg: string, err?: Error): void;

    verbose(msg: string): void;

    debug(msg: string): void;

    info(msg: string): void;

    warn(msg: string, err?: Error): void;

    error(msg: string, err?: Error): void;

    fatal(msg: string, err?: Error): void;
}