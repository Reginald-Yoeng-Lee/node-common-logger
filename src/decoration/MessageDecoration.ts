import type Logger from "../Logger";

export default interface MessageDecoration {

    beforeDecorate?(logger: Logger, msg: string): [boolean, string] | string;

    decorate?(logger: Logger, msg: string): string;
}