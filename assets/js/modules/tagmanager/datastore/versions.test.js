/**
 * modules/tagmanager data store: versions tests.
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
import API from 'googlesitekit-api';
import { STORE_NAME } from './constants';
import {
	createTestRegistry,
	muteConsole,
	muteFetch,
	untilResolved,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import * as fixtures from './__fixtures__';

describe( 'modules/tagmanager versions', () => {
	let registry;

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'actions', () => {
		describe( 'receiveGetLiveContainerVersion', () => {
			const validContainerVersion = {};
			const validAccountID = '100';
			const validInternalContainerID = '200';

			it( 'requires a liveContainerVersion object', () => {
				expect(
					() => registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion()
				).toThrow( 'response is required.' );
			} );

			it( 'requires params', () => {
				expect(
					() => registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( validContainerVersion )
				).toThrow( 'params is required.' );
			} );

			it( 'does not throw with valid input', () => {
				expect( () => {
					registry.dispatch( STORE_NAME )
						.receiveGetLiveContainerVersion( validContainerVersion, {
							accountID: validAccountID,
							internalContainerID: validInternalContainerID,
						} );
				} ).not.toThrow();
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getLiveContainerAnalyticsTag', () => {
			it( 'returns the Universal Analytics tag object from the live container object', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.gaWithVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const tagObject = registry.select( STORE_NAME ).getLiveContainerAnalyticsTag( accountID, internalContainerID );

				expect( tagObject ).toEqual( liveContainerVersionFixture.tag[ 0 ] );
			} );

			it( 'returns the Universal Analytics tag object from the live container object for an AMP container', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.amp.ga;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const tagObject = registry.select( STORE_NAME ).getLiveContainerAnalyticsTag( accountID, internalContainerID );

				expect( tagObject ).toEqual( liveContainerVersionFixture.tag[ 0 ] );
			} );

			it( 'returns null if the live container version does not contain a Universal Analytics tag', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const tagObject = registry.select( STORE_NAME ).getLiveContainerAnalyticsTag( accountID, internalContainerID );

				expect( tagObject ).toStrictEqual( null );
			} );

			it( 'returns null if no live container version exists', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( null, { accountID, internalContainerID } );

				const tagObject = registry.select( STORE_NAME ).getLiveContainerAnalyticsTag( accountID, internalContainerID );

				expect( tagObject ).toStrictEqual( null );
			} );

			it( 'returns undefined if the live container version is not loaded yet', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;

				muteFetch( /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/ );
				const tagObject = registry.select( STORE_NAME ).getLiveContainerAnalyticsTag( accountID, internalContainerID );

				expect( tagObject ).toStrictEqual( undefined );
			} );
		} );

		describe( 'getLiveContainerAnalyticsPropertyID', () => {
			it( 'gets the propertyID associated with the Universal Analytics tag settings variable', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.gaWithVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const propertyID = registry.select( STORE_NAME ).getLiveContainerAnalyticsPropertyID( accountID, internalContainerID );

				expect( propertyID ).toBe( 'UA-123456789-1' );
			} );

			it( 'gets the propertyID associated with the Universal Analytics tag settings when provided directly', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.gaWithOverride;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const propertyID = registry.select( STORE_NAME ).getLiveContainerAnalyticsPropertyID( accountID, internalContainerID );

				expect( propertyID ).toBe( 'UA-1234567-99' );
			} );

			it( 'gets the propertyID associated with the Universal Analytics tag for an AMP container', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.amp.ga;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const propertyID = registry.select( STORE_NAME ).getLiveContainerAnalyticsPropertyID( accountID, internalContainerID );

				expect( propertyID ).toBe( 'UA-98765432-1' );
			} );

			it( 'returns null if no Analytics tag exists in the container', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const propertyID = registry.select( STORE_NAME ).getLiveContainerAnalyticsPropertyID( accountID, internalContainerID );

				expect( propertyID ).toStrictEqual( null );
			} );

			it( 'returns undefined if the live container version is not loaded yet', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;

				muteFetch( /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/ );
				const propertyID = registry.select( STORE_NAME ).getLiveContainerAnalyticsPropertyID( accountID, internalContainerID );

				expect( propertyID ).toStrictEqual( undefined );
			} );
		} );

		describe( 'getLiveContainerVariable', () => {
			it( 'returns the variable object from the live container object by variable name', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const variableName = 'Test Variable';
				const variableObject = registry.select( STORE_NAME ).getLiveContainerVariable( accountID, internalContainerID, variableName );

				expect( variableObject ).toEqual( liveContainerVersionFixture.variable[ 0 ] );
			} );

			it( 'returns null if no variable exists by the given name', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( liveContainerVersionFixture, { accountID, internalContainerID } );

				const variableName = 'Non-existent Variable';
				const variableObject = registry.select( STORE_NAME ).getLiveContainerVariable( accountID, internalContainerID, variableName );

				expect( variableObject ).toStrictEqual( null );
			} );

			it( 'returns null if no live container version exists', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion( null, { accountID, internalContainerID } );

				const variableName = 'Test Variable';
				const variableObject = registry.select( STORE_NAME ).getLiveContainerVariable( accountID, internalContainerID, variableName );

				expect( variableObject ).toStrictEqual( null );
			} );

			it( 'returns undefined if the live container version is not loaded yet', () => {
				const liveContainerVersionFixture = fixtures.liveContainerVersions.web.withVariable;
				const accountID = liveContainerVersionFixture.accountId;
				const internalContainerID = liveContainerVersionFixture.containerId;
				const variableName = 'Test Variable';

				muteFetch( /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/ );
				const variableObject = registry.select( STORE_NAME ).getLiveContainerVariable( accountID, internalContainerID, variableName );

				expect( variableObject ).toStrictEqual( undefined );
			} );
		} );

		describe( 'getLiveContainerVersion', () => {
			it( 'uses a resolver to make a network request', async () => {
				const accountID = fixtures.liveContainerVersion.accountId;
				const internalContainerID = fixtures.liveContainerVersion.containerId;

				fetchMock.getOnce(
					/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/,
					{ body: fixtures.liveContainerVersion, status: 200 }
				);

				const initialContainerVersion = registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				expect( initialContainerVersion ).toEqual( undefined );
				await untilResolved( registry, STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				const liveContainerVersion = registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );
				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( liveContainerVersion ).toEqual( fixtures.liveContainerVersion );
			} );

			it( 'does not make a network request if the container version is already present', async () => {
				const accountID = fixtures.liveContainerVersion.accountId;
				const internalContainerID = fixtures.liveContainerVersion.containerId;

				registry.dispatch( STORE_NAME ).receiveGetLiveContainerVersion(
					fixtures.liveContainerVersion,
					{ accountID, internalContainerID }
				);

				const liveContainerVersion = registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );
				await untilResolved( registry, STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				expect( liveContainerVersion ).toEqual( fixtures.liveContainerVersion );
				expect( fetchMock ).not.toHaveFetched();
			} );

			it( 'dispatches an error if the request fails', async () => {
				const accountID = fixtures.liveContainerVersion.accountId;
				const internalContainerID = fixtures.liveContainerVersion.containerId;
				const errorResponse = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};
				fetchMock.getOnce(
					/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/,
					{ body: errorResponse, status: 500 }
				);

				muteConsole( 'error' );
				registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );
				await untilResolved( registry, STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( registry.select( STORE_NAME ).getError() ).toEqual( errorResponse );
				expect( registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID ) ).toEqual( undefined );
			} );

			it( 'receives null if the container has no published version', async () => {
				const accountID = fixtures.liveContainerVersion.accountId;
				const internalContainerID = fixtures.liveContainerVersion.containerId;
				const notFoundResponse = {
					code: 404,
					message: 'Published container version not found',
					data: {
						status: 404,
						reason: 'notFound',
					},
				};

				fetchMock.getOnce(
					/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/,
					{ body: notFoundResponse, status: 404 }
				);

				muteConsole( 'error' );
				registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );
				await untilResolved( registry, STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( registry.select( STORE_NAME ).getError() ).toBeFalsy();
				expect( registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID ) ).toEqual( null );
			} );
		} );

		describe( 'isDoingGetLiveContainerVersion', () => {
			it( 'returns true while the live container version fetch is in progress', async () => {
				const accountID = '100';
				const internalContainerID = '200';

				muteFetch( /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/live-container-version/ );
				expect(
					registry.select( STORE_NAME ).isDoingGetLiveContainerVersion( accountID, internalContainerID )
				).toBe( false );

				registry.select( STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				expect(
					registry.select( STORE_NAME ).isDoingGetLiveContainerVersion( accountID, internalContainerID )
				).toBe( true );

				await untilResolved( registry, STORE_NAME ).getLiveContainerVersion( accountID, internalContainerID );

				expect(
					registry.select( STORE_NAME ).isDoingGetLiveContainerVersion( accountID, internalContainerID )
				).toBe( false );
			} );
		} );
	} );
} );
