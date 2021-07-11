import Logger from "./Logger";
import LogLevel from "./LogLevel";
import DefaultLogStrategy from "./strategy/DefaultLogStrategy";

const logger = new Logger(LogLevel.INFO, new DefaultLogStrategy());

export default logger;

export {default as LogStrategy} from './strategy/LogStrategy';
export {default as MessageDecoration} from './decoration/MessageDecoration';
export {logger, Logger, LogLevel};