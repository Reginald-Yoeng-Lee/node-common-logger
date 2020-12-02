import Logger from "./Logger";
import LogLevel from "./LogLevel";
import DefaultLogStrategy from "./DefaultLogStrategy";

const logger = new Logger(LogLevel.INFO, new DefaultLogStrategy());

export default logger;

export {default as LogStrategy} from './LogStrategy';
export {logger, LogLevel};