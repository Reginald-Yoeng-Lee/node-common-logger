import LogStrategy from "./strategy/LogStrategy";
import LogLevel from "./LogLevel";
import MessageDecoration from "./decoration/MessageDecoration";

export default class Logger implements LogStrategy {

    logLevel: LogLevel;

    private strategy: LogStrategy;
    private readonly messageDecorations: MessageDecoration[];

    private currentTag?: string;
    private tagSeparator?: string;
    private argumentValue?: string;
    private argumentPlaceholder?: string;
    private readonly categoryLogStrategyCache = new Map<string, LogStrategy>();

    constructor(logLevel: LogLevel, logStrategy: LogStrategy, ...msgDecorations: MessageDecoration[]) {
        this.logLevel = logLevel;
        this.strategy = logStrategy;
        this.messageDecorations = [{
            decorate: (logger, logLevel, msg): string => {
                if (logger.currentTag) {
                    msg = `${logger.currentTag}${logger.tagSeparator || ''}${msg}`;
                }
                return logger.applyArgument(msg);
            },
        }];
        msgDecorations.forEach(decoration => this.addMessageDecoration(decoration));
    }

    set logStrategy(strategy: LogStrategy) {
        if (this.strategy !== strategy) {
            this.strategy = strategy;
            const categoryNames = this.categoryLogStrategyCache.keys();
            for (let name of categoryNames) {
                this.categoryLogStrategyCache.set(name, strategy.category(name));
            }
        }
    }

    get logStrategy(): LogStrategy {
        return this.strategy;
    }

    addMessageDecoration(messageDecoration: MessageDecoration): Logger {
        for (let [i, decoration] of this.messageDecorations.entries()) {
            if ((messageDecoration.priority || 0) < (decoration.priority || 0)) {
                this.messageDecorations.splice(i, 0, messageDecoration);
                return this;
            }
        }
        this.messageDecorations.push(messageDecoration);
        return this;
    }

    getMessageDecorations(): MessageDecoration[] {
        return [...this.messageDecorations];
    }

    clearMessageDecorations(): Logger {
        this.messageDecorations.length = 0;
        return this;
    }

    /**
     * Fetch a specific named category logger. The result may be fetched from the cache unless <code>useCache</code> is
     * set to <code>false</code>. Since the category is relative to the basic LogStrategy, the caches would be rebuilt if
     * the base LogStrategy changed.
     *
     * Notice: The Logger returned from here should be a wrapped one. So if we want to change the basic LogStrategy (which
     * would be applied to all Loggers), do NOT modify the logStrategy property of the returned Logger.
     *
     * As mentioned above, the Logger returned from here is a wrapped one, which get the category-related LogStrategy from
     * the cache by category name. Since the cache will be rebuilt by the main logger (the one created from the very beginning)
     * whenever the logStrategy of the main logger changed, the category-related LogStrategy fetched from the cache should
     * NEVER be null.
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
        const logger = this.derive();
        Object.defineProperty(logger, 'strategy', {
            get(): LogStrategy {
                const strategy = this.categoryLogStrategyCache.get(name);
                if (!strategy) {
                    throw new Error(`undefined strategy for ${name}. This should NOT gonna happen. Please report this as a bug.`);
                }
                return strategy;
            },
        });
        return logger;
    }

    log(level: LogLevel, msg: string, err?: Error): void {
        if (!this.shouldLog(level)) {
            return;
        }
        if (this.logStrategy.log) {
            this.logStrategy.log(level, this.decorateMsg(level, msg), err);
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
        this.shouldLog(LogLevel.VERBOSE) && this.logStrategy.verbose(this.decorateMsg(LogLevel.VERBOSE, msg));
    }

    debug(msg: string): void {
        this.shouldLog(LogLevel.DEBUG) && this.logStrategy.debug(this.decorateMsg(LogLevel.DEBUG, msg));
    }

    info(msg: string): void {
        this.shouldLog(LogLevel.INFO) && this.logStrategy.info(this.decorateMsg(LogLevel.INFO, msg));
    }

    warn(msg: string, err?: Error): void {
        this.shouldLog(LogLevel.WARN) && this.logStrategy.warn(this.decorateMsg(LogLevel.WARN, msg), err);
    }

    error(msg: string, err?: Error): void {
        this.shouldLog(LogLevel.ERROR) && this.logStrategy.error(this.decorateMsg(LogLevel.ERROR, msg), err);
    }

    fatal(msg: string, err?: Error): void {
        this.shouldLog(LogLevel.FATAL) && this.logStrategy.fatal(this.decorateMsg(LogLevel.FATAL, msg), err);
    }

    shouldLog(level: LogLevel): boolean {
        return this.logLevel >= level;
    }

    /**
     * Fetch a logger that prepends a tag right before the actual logging content automatically.
     *
     * Notice: The Logger returned from here should be a wrapped one. So if we want to change the basic LogStrategy (which
     * would be applied to all Loggers), do NOT modify the logStrategy property of the returned Logger.
     * Instead, modify the original one. In other word, change the logStrategy of the original logger will affect the derived
     * ones (the logger returns from this method).
     *
     * @param tag The text being prepended.
     * @param separator The text between the tag and the content.
     */
    tag(tag: string, separator: string = ' - '): Logger {
        const logger = this.derive();
        logger.currentTag = tag;
        logger.tagSeparator = separator;
        return logger;
    }

    /**
     * Fetch a logger allows replace the first special symbol in the current logging content to the very argument. We could
     * call this method multiple times in chain for replace multiple symbols.
     *
     * Notice: The Logger returned from here should be a wrapped one. So if we want to change the basic LogStrategy (which
     * would be applied to all Loggers), do NOT modify the logStrategy property of the returned Logger.
     * Instead, modify the original one. In other word, change the logStrategy of the original logger will affect the derived
     * ones (the logger returns from this method).
     *
     * @param val
     * @param placeholder
     */
    addArgument(val: string, placeholder: string = '{}'): Logger {
        const logger = this.derive();
        logger.argumentValue = val;
        logger.argumentPlaceholder = placeholder;
        return logger;
    }

    private applyArgument(msg: string): string {
        const prototype = Object.getPrototypeOf(this);
        if (prototype instanceof Logger) {
            msg = prototype.applyArgument(msg);
        }
        return this.argumentPlaceholder && this.argumentValue && msg.replace(this.argumentPlaceholder, this.argumentValue) || msg;
    }

    protected derive(): Logger {
        const logger = Object.create(this);
        logger.messageDecorations = [...this.messageDecorations];
        return logger;
    }

    private decorateMsg(logLevel: LogLevel, msg: string): string {
        return this.messageDecorations.reduce((previousMsg, decoration) => decoration.decorate(this, logLevel, previousMsg), msg);
    }
}