/**
 * External dependencies
 */
const { command } = require( 'execa' );
const { isEmpty, omitBy } = require( 'lodash' );
const npmPackageArg = require( 'npm-package-arg' );
const { join } = require( 'path' );
const writePkg = require( 'write-pkg' );

/**
 * Internal dependencies
 */
const { info, error } = require( './log' );

module.exports = async ( {
	author,
	description,
	license,
	pluginURI,
	slug,
	version,
	wpEnv,
	wpScripts,
	npmDependencies,
	npmDevDependencies,
	customScripts,
} ) => {
	const cwd = join( process.cwd(), slug );

	info( '' );
	info( 'Creating a "package.json" file.' );

	await writePkg(
		cwd,
		omitBy(
			{
				name: slug,
				version,
				description,
				author,
				license,
				homepage: pluginURI,
				main: wpScripts && 'build/index.js',
				scripts: {
					...( wpScripts && {
						build: 'wp-scripts build',
						format: 'wp-scripts format',
						'lint:css': 'wp-scripts lint-style',
						'lint:js': 'wp-scripts lint-js',
						'packages-update': 'wp-scripts packages-update',
						'plugin-zip': 'wp-scripts plugin-zip',
						start: 'wp-scripts start',
					} ),
					...( wpEnv && { env: 'wp-env' } ),
					...customScripts,
				},
			},
			isEmpty
		)
	);

	/**
	 * Helper to determine if we can install this package.
	 *
	 * @param {string} packageArg The package to install.
	 */
	function checkDependency( packageArg ) {
		const { type } = npmPackageArg( packageArg );
		if (
			! [ 'git', 'tag', 'version', 'range', 'remote' ].includes( type )
		) {
			throw new Error(
				`Provided package type "${ type }" is not supported.`
			);
		}
	}

	if ( wpScripts ) {
		if ( npmDependencies.length ) {
			info( '' );
			info(
				'Installing npm dependencies. It might take a couple of minutes...'
			);
			for ( const packageArg of npmDependencies ) {
				try {
					checkDependency( packageArg );
					info( '' );
					info( `Installing "${ packageArg }".` );
					await command( `npm install ${ packageArg }`, {
						cwd,
					} );
				} catch ( { message } ) {
					info( '' );
					info(
						`Skipping "${ packageArg }" npm dependency. Reason:`
					);
					error( message );
				}
			}
		}

		if ( npmDevDependencies.length ) {
			info( '' );
			info(
				'Installing npm devDependencies. It might take a couple of minutes...'
			);
			for ( const packageArg of npmDevDependencies ) {
				try {
					checkDependency( packageArg );
					info( '' );
					info( `Installing "${ packageArg }".` );
					await command( `npm install ${ packageArg } --save-dev`, {
						cwd,
					} );
				} catch ( { message } ) {
					info( '' );
					info(
						`Skipping "${ packageArg }" npm dev dependency. Reason:`
					);
					error( message );
				}
			}
		}
	}
};
