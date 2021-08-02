import type Logger from "../Logger";
import LogLevel from "../LogLevel";

export default interface MessageDecoration {

    /**
     * Modify the message being logged.
     *
     * @param logger The logger for logging the message.
     * @param logLevel
     * @param msg
     */
    decorate(logger: Logger, logLevel: LogLevel, msg: string): string;

    /**
     * The priority of the current MessageDecoration. Smaller value represent higher priority, which means it will be
     * applied to earlier. e.g. A message will be decorated by the MessageDecoration with priority -1, then by the one with
     * priority 0, then by the one with priority 1. For the decorations which have the same priority values, the former
     * added one has the higher priority. e.g. The message will be decorated by the decoration as the order of the decorations
     * being added to the logger. Default is 0.
     */
    priority?: number;
}