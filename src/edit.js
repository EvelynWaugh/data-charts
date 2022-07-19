/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';
import {useState} from '@wordpress/element';
import { times, get, mapValues, every, pick } from 'lodash';
/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';
import { Button, Modal } from "@wordpress/components";
import Table from './table';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({attributes, setAttributes}) {
	const [opened, setOpened] = useState(false);

	const createTable = ( { rowCount, columnCount } ) => {
		return {
			head: times(1, () => ({
				cells: times( columnCount, () => ( {
					content: '',
				} ) ),
			})),
			body: times( rowCount, () => ( {
				cells: times( columnCount, () => ( {
					content: '',
					
				} ) ),
			} ) ),
		};
	}
	const onCreateTable = (  ) => {
		 
		setAttributes(
			createTable( {
				rowCount: 5,
				columnCount: 1,
			} )
		);
		// setHasTableCreated( true );
	}
	const openModal = () => {
		if(attributes.head.length < 1) {
			onCreateTable();
		}
		

		setOpened(true)
	}
	const closeModal = () => {
		setOpened(false)
	}
	const saveData = () => {
		setOpened(false)
	}
	
	

	const defaultData = { 
		head: [
		{
			cells: [
				{
					content: __( 'Version' ),
					tag: 'th',
				},
				{
					content: __( 'Jazz Musician' ),
					tag: 'th',
				},
				{
					content: __( 'Release Date' ),
					tag: 'th',
				},
			],
		},
	],
	body: [
		{
			cells: [
				{
					content: '5.2',
					tag: 'td',
				},
				{
					content: 'Jaco Pastorius',
					tag: 'td',
				},
				{
					content: __( 'May 7, 2019' ),
					tag: 'td',
				},
			],
		},
		{
			cells: [
				{
					content: '5.1',
					tag: 'td',
				},
				{
					content: 'Betty Carter',
					tag: 'td',
				},
				{
					content: __( 'February 21, 2019' ),
					tag: 'td',
				},
			],
		},
		{
			cells: [
				{
					content: '5.0',
					tag: 'td',
				},
				{
					content: 'Bebo Valdés',
					tag: 'td',
				},
				{
					content: __( 'December 6, 2018' ),
					tag: 'td',
				},
			],
		},
	],
}
console.log(mapValues(defaultData,  ( section, sectionName ) => {
	console.log(section, sectionName);
	return section.map( ( row ) => {
		console.log(row);
		return row;
	})
}));
	return (
		<div { ...useBlockProps() }>
			<Button onClick={openModal}>{__('Configure data charts')}</Button>

			{ opened && (
                <Modal title="Charts data" onRequestClose={ closeModal } isFullScreen>
					<Table attributes={attributes} setAttributes={setAttributes} />
                    <Button variant="secondary" onClick={ saveData }>
                        Save
                    </Button>
                </Modal>
            ) }
		</div>
	);
}
