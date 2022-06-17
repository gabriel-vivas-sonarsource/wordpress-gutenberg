/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { css } from '@emotion/react';

/**
 * Internal dependencies
 */
import { space } from '../ui/utils/space';

type TokensAndInputWrapperProps = {
	__next36pxDefaultSize: boolean;
	hasTokens: boolean;
};

const deprecatedPaddings = ( {
	__next36pxDefaultSize,
	hasTokens,
}: TokensAndInputWrapperProps ) =>
	! __next36pxDefaultSize &&
	css`
		padding-top: ${ space( hasTokens ? 1 : 0.5 ) };
		padding-bottom: ${ space( hasTokens ? 1 : 0.5 ) };
	`;

export const TokensAndInputWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: ${ space( 1 ) };
	padding: 5px ${ space( 1 ) };

	${ deprecatedPaddings }
`;
