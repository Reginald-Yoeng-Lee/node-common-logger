import LogStrategy from "./LogStrategy";
import LogLevel from "./LogLevel";

export default class Logger implements LogStrategy {

    logLevel: LogLevel;

    private strategy: LogStrategy;

    private currentTag?: string;
    private tagSeparator?: string;
    private args?: [string, string][];
    private readonly categoryLogStrategyCache = new Map<string, LogStrategy>();

    #main = true;

    constructor(logLevel: LogLevel, logStrategy: LogStrategy) {
        this.logLevel = logLevel;
        this.strategy = logStrategy;
    }

    set logStrategy(strategy: LogStrategy) {
        if (this.strategy !== strategy) {
            this.strategy = strategy;
            this.categoryLogStrategyCache.clear();
        }
    }

    get logStrategy(): LogStrategy {
        return this.strategy;
    }

    /**
     * Fetch a specific named category logger. The result may be fetched from the cache unless <code>useCache</code> is
     * set to <code>false</code>. Since the category is relative to the basic LogStrategy, the caches would be cleared if
     * the base LogStrategy changed.
     *
     * Notice: The Logger returned from here could be a brand new one. So if we want to change the basic LogStrategy (which
     * would be applied to the successor new Logger), do NOT modify the logStrategy property of the returned Logger.
     * Instead, modify the one imported.
     *
     * The returned Logger should be considered as a <i>short term</i> object, which means we should always fetch a new
     * one when using instead of keeping or reusing the old one. Otherwise the new LogStrategy being applied to the logger
     * (if any) can NOT be applied to the old returned Logger.
     *
     * @param name
     * @param useCache
     */
    category(name: string, useCache: boolean = true): Logger {
        let categoryStrategy = useCache && this.categoryLogStrategyCache.get(name);
        if (!categoryStrategy) {
            categoryStrategy = this.logStrategy.category(name);
            this.categoryLogStrategyCache.set(name, categoryStrategy);
        }
        return this.createSubLogger(categoryStrategy);
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

    /**
     * Fetch a logger that prepends a tag right before the actual logging content automatically.
     *
     * Notice: The Logger returned from here could be a brand new one. So if we want to change the basic LogStrategy (which
     * would be applied to the successor new Logger), do NOT modify the logStrategy property of the returned Logger.
     * Instead, modify the one imported.
     *
     * The returned Logger should be considered as a <i>short term</i> object, which means we should always fetch a new
     * one when using instead of keeping or reusing the old one. Otherwise the new LogStrategy being applied to the logger
     * (if any) can NOT be applied to the old returned Logger.
     *
     * @param tag The text being prepended.
     * @param separator The text between the tag and the content.
     */
    tag(tag: string, separator: string = ' - '): Logger {
        const logger = this.createSubLogger();
        logger.currentTag = tag;
        logger.tagSeparator = separator;
        return logger;
    }

    /**
     * Fetch a logger allows replace the first special symbol in the current logging content to the very argument. We could
     * call this method multiple times in chain for replace multiple symbols.
     *
     * Notice: The Logger returned from here could be a brand new one. So if we want to change the basic LogStrategy (which
     * would be applied to the successor new Logger), do NOT modify the logStrategy property of the returned Logger.
     * Instead, modify the one imported.
     *
     * The returned Logger should be considered as a <i>short term</i> object, which means we should always fetch a new
     * one when using instead of keeping or reusing the old one. Otherwise the new LogStrategy being applied to the logger
     * (if any) can NOT be applied to the old returned Logger.
     *
     * @param val
     * @param placeholder
     */
    addArgument(val: string, placeholder: string = '{}'): Logger {
        const logger = this.createSubLogger();
        logger.args || (logger.args = []);
        logger.args.push([placeholder, val]);
        return logger;
    }

    private createSubLogger(logStrategy: LogStrategy = this.logStrategy): Logger {
        if (this.#main) {
            const logger = new Logger(this.logLevel, logStrategy);
            logger.#main = false;
            this.categoryLogStrategyCache.forEach((s, key) => logger.categoryLogStrategyCache.set(key, s));
            return logger;
        } else if (logStrategy !== this.logStrategy) {
            this.logStrategy = logStrategy;
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