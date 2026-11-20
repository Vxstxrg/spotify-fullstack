import * as PlayerActionCreators from './player';
import * as TrackActionCreators from './track';
import * as AuthActionCreators from './auth';

export default {
	...PlayerActionCreators,
	...TrackActionCreators,
	...AuthActionCreators
}
