import Logger from "./Logger";
import LogLevel from "./LogLevel";
import DefaultLogStrategy from "./DefaultLogStrategy";

export default new Logger(LogLevel.INFO, new DefaultLogStrategy());

export * from './LogStrategy';
export * from './LogLevel';