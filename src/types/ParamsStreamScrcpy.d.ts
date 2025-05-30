import { ACTION } from '../common/Action';
import { ParamsStream } from './ParamsStream';
import VideoSettings from '../utils/VideoSettings';

export interface ParamsStreamScrcpy extends ParamsStream {
    action: ACTION.STREAM_SCRCPY;
    ws: string;
    fitToScreen?: boolean;
    videoSettings?: VideoSettings;
}
