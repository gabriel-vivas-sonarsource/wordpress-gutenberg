/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import { __experimentalInspectorPopoverHeader as InspectorPopoverHeader } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { addTemplate } from '@wordpress/icons';
import { Notice, SelectControl, Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';
import PostTemplateCreateModal from './create-modal';

export default function PostTemplateForm( { onClose } ) {
	const {
		isPostsPage,
		availableTemplates,
		fetchedTemplates,
		selectedTemplateSlug,
		canCreate,
		canEdit,
	} = useSelect( ( select ) => {
		const editorSettings = select( editorStore ).getEditorSettings();
		const siteSettings = select( coreStore ).getEntityRecord(
			'root',
			'site'
		);
		const _isPostsPage =
			select( editorStore ).getCurrentPostId() ===
			siteSettings?.page_for_posts;
		const canCreateTemplates = select( coreStore ).canUser(
			'create',
			'templates'
		);
		return {
			isPostsPage: _isPostsPage,
			availableTemplates: editorSettings.availableTemplates,
			fetchedTemplates: select( coreStore ).getEntityRecords(
				'postType',
				'wp_template',
				{
					post_type: select( editorStore ).getCurrentPostType(),
					per_page: -1,
				}
			),
			selectedTemplateSlug:
				select( editorStore ).getEditedPostAttribute( 'template' ),
			canCreate: canCreateTemplates && ! _isPostsPage,
			canEdit:
				canCreateTemplates &&
				editorSettings.supportsTemplateMode &&
				!! select( editPostStore ).getEditedPostTemplate(),
		};
	}, [] );

	const options = useMemo(
		() =>
			Object.entries( {
				...availableTemplates,
				...Object.fromEntries(
					( fetchedTemplates ?? [] ).map( ( { slug, title } ) => [
						slug,
						title.rendered,
					] )
				),
			} ).map( ( [ slug, title ] ) => ( { value: slug, label: title } ) ),
		[ availableTemplates, fetchedTemplates ]
	);

	const selectedOption =
		options.find( ( option ) => option.value === selectedTemplateSlug ) ??
		options.find( ( option ) => ! option.value ); // The default option has '' value.

	const { editPost } = useDispatch( editorStore );
	const { __unstableSwitchToTemplateMode } = useDispatch( editPostStore );

	const [ isCreateModalOpen, setIsCreateModalOpen ] = useState( false );

	return (
		<div className="edit-post-post-template__form">
			<InspectorPopoverHeader
				title={ __( 'Template' ) }
				help={ __(
					'Templates define the way content is displayed when viewing your site.'
				) }
				actions={
					canCreate
						? [
								{
									icon: addTemplate,
									label: __( 'Add template' ),
									onClick: () => setIsCreateModalOpen( true ),
								},
						  ]
						: []
				}
				onClose={ onClose }
			/>
			{ isPostsPage ? (
				<Notice
					className="edit-post-post-template__notice"
					status="warning"
					isDismissible={ false }
				>
					{ __( 'The posts page template cannot be changed.' ) }
				</Notice>
			) : (
				<SelectControl
					hideLabelFromVision
					label={ __( 'Template' ) }
					value={ selectedOption?.value ?? '' }
					options={ options }
					onChange={ ( slug ) =>
						editPost( { template: slug || '' } )
					}
				/>
			) }
			{ canEdit && (
				<p>
					<Button
						variant="link"
						onClick={ () => __unstableSwitchToTemplateMode() }
					>
						{ __( 'Edit template' ) }
					</Button>
				</p>
			) }
			{ isCreateModalOpen && (
				<PostTemplateCreateModal
					onClose={ () => setIsCreateModalOpen( false ) }
				/>
			) }
		</div>
	);
}
