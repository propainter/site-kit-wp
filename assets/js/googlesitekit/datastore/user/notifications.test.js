/**
 * User info data store: notifications.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies
 */
import { actions, selectors } from './index';

describe( 'core/user notifications', () => {
	it( 'has appropriate notification methods', () => {
		const actionsToExpect = [
			'addNotification',
			'removeNotification',
		];
		expect( Object.keys( actions ) ).toEqual( expect.arrayContaining( actionsToExpect ) );

		const selectorsToExpect = [
			'getNotifications',
		];
		expect( Object.keys( selectors ) ).toEqual( expect.arrayContaining( selectorsToExpect ) );
	} );
} );
