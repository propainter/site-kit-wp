/**
 * Core site data store: HTML for URL.
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
 * External dependencies
 */
import invariant from 'invariant';

/**
 * WordPress dependencies
 */
import { isURL, addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { STORE_NAME } from './constants';
import { createFetchStore } from '../../../googlesitekit/data/create-fetch-store';

const { createRegistryControl } = Data;

const fetchHTMLForURLStore = createFetchStore( {
	baseName: 'getHTMLForURL',
	argsToParams: ( url ) => {
		return { url };
	},
	validateParams: ( { url } = {} ) => {
		invariant( isURL( url ), 'a valid url is required to fetch HTML.' );
	},
	controlCallback: async ( { url } ) => {
		const fetchHTMLOptions = {
			credentials: 'omit',
		};
		const fetchHTMLQueryArgs = {
			// Indicates a tag checking request. This lets Site Kit know not to output its own tags.
			tagverify: 1,
			// Add a timestamp for cache-busting.
			timestamp: Date.now(),
		};
		const response = await fetch( addQueryArgs( url, fetchHTMLQueryArgs ), fetchHTMLOptions );

		// If response contains HTML, return that. Return null in other cases.
		try {
			const html = await response.text();
			return html !== undefined ? html : null;
		} catch {
			return null;
		}
	},
	reducerCallback: ( state, htmlForURL, { url } ) => {
		return {
			...state,
			htmlForURL: {
				...state.htmlForURL,
				[ url ]: htmlForURL,
			},
		};
	},
} );

// Actions
const RESET_HTML_FOR_URL = 'RESET_HTML_FOR_URL';
const WAIT_FOR_HTML_FOR_URL = 'WAIT_FOR_HTML_FOR_URL';

export const baseInitialState = {
	htmlForURL: {},
};

const baseActions = {
	/**
	 * Resets the HTML for a given URL.
	 *
	 * @since 1.13.0
	 * @private
	 *
	 * @param {string} url URL for which the HTML should be reset.
	 * @return {Object} Redux-style action.
	 */
	*resetHTMLForURL( url ) {
		const { dispatch } = yield Data.commonActions.getRegistry();

		yield {
			payload: { url },
			type: RESET_HTML_FOR_URL,
		};

		return dispatch( STORE_NAME ).invalidateResolutionForStoreSelector( 'getHTMLForURL' );
	},

	/**
	 * Waits for HTML for to be resolved for the given URL.
	 *
	 * @since 1.13.0
	 * @private
	 *
	 * @param {string} url URL for which to fetch HTML.
	 * @yield {Object} Redux-style action.
	 */
	*waitForHTMLForURL( url ) {
		yield {
			payload: { url },
			type: WAIT_FOR_HTML_FOR_URL,
		};
	},
};

const baseControls = {
	[ WAIT_FOR_HTML_FOR_URL ]: createRegistryControl( ( registry ) => ( { payload: { url } } ) => (
		registry.__experimentalResolveSelect( STORE_NAME ).getHTMLForURL( url )
	) ),
};

const baseReducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case RESET_HTML_FOR_URL: {
			const { url } = payload;
			return {
				...state,
				htmlForURL: {
					...state.htmlForURL,
					[ url ]: undefined,
				},
			};
		}

		default: {
			return state;
		}
	}
};

export const baseResolvers = {
	*getHTMLForURL( url ) {
		const registry = yield Data.commonActions.getRegistry();

		const existingHTML = registry.select( STORE_NAME ).getHTMLForURL( url );

		if ( existingHTML === undefined ) {
			yield fetchHTMLForURLStore.actions.fetchGetHTMLForURL( url );
		}
	},
};

export const baseSelectors = {
	/**
	 * Gets the HTML for a given URL.
	 *
	 * Returns `undefined` if the HTML is not available/loaded.
	 *
	 * Returns a string representation of the HTML when successful.
	 *
	 * @since 1.13.0
	 * @private
	 *
	 * @param {Object} state Data store's state.
	 * @param {string} url   URL for which to fetch HTML.
	 * @return {(string|undefined)} String representation of HTML for given URL, or `undefined` if not loaded yet.
	 */
	getHTMLForURL( state, url ) {
		return state.htmlForURL[ url ];
	},
};

const store = Data.combineStores(
	fetchHTMLForURLStore,
	{
		initialState: baseInitialState,
		actions: baseActions,
		controls: baseControls,
		reducer: baseReducer,
		resolvers: baseResolvers,
		selectors: baseSelectors,
	}
);

export const initialState = store.initialState;
export const actions = store.actions;
export const controls = store.controls;
export const reducer = store.reducer;
export const resolvers = store.resolvers;
export const selectors = store.selectors;

export default store;
