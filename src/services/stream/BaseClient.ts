import { TypedEmitter } from '../../common/TypedEmitter';
import type {EventMap} from '../../common/TypedEmitter';
import type { ParamsBase } from '../../types/ParamsBase';
import Util from '../../utils/Util';

export class BaseClient<P extends ParamsBase, TE extends EventMap> extends TypedEmitter<TE> {
    protected title = 'BaseClient';
    protected params: P;

    protected constructor(params: P) {
        super();
        this.params = params;
    }

    public static parseParameters(query: URLSearchParams): ParamsBase {
        const action = Util.parseStringEnv(query.get('action'));
        if (!action) {
            throw TypeError('Invalid action');
        }
        return {
            action: action,
            useProxy: Util.parseBooleanEnv(query.get('useProxy')),
            secure: Util.parseBooleanEnv(query.get('secure')),
            hostname: Util.parseStringEnv(query.get('hostname')),
            port: Util.parseIntEnv(query.get('port')),
            pathname: Util.parseStringEnv(query.get('pathname')),
        };
    }

   
}
