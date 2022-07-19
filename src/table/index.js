/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from "@wordpress/element";
import {
	InspectorControls,
	BlockControls,
	RichText,
	BlockIcon,
	AlignmentControl,
	useBlockProps,
	__experimentalUseColorProps as useColorProps,
	__experimentalUseBorderProps as useBorderProps,
	__experimentalGetElementClassName,
} from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
	Button,
	PanelBody,
	Placeholder,
	TextControl,
	ToggleControl,
	ToolbarDropdownMenu,
	__experimentalHasSplitBorders as hasSplitBorders,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from "@wordpress/components";
import {
	alignLeft,
	alignRight,
	alignCenter,
	blockTable as icon,
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete,
	table,
	plus,
	more,
	trash,
} from "@wordpress/icons";
import { createBlock, getDefaultBlockName } from "@wordpress/blocks";

/**
 * Internal dependencies
 */
import {
	createTable,
	updateSelectedCell,
	getCellAttribute,
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	toggleSection,
	isEmptyTableSection,
} from "./state";

const Table = ({
	attributes,
	setAttributes,
	insertBlocksAfter,
	isSelected,
}) => {
	const { head } = attributes;
	const [initialRowCount, setInitialRowCount] = useState(5);
	const [initialColumnCount, setInitialColumnCount] = useState(1);
	const [selectedCell, setSelectedCell] = useState();

	const colorProps = useColorProps(attributes);
	const borderProps = useBorderProps(attributes);

	const tableRef = useRef();
	const [hasTableCreated, setHasTableCreated] = useState(false);

	/**
	 * Updates the initial column count used for table creation.
	 *
	 * @param {number} count New initial column count.
	 */
	function onChangeInitialColumnCount(count) {
		setInitialColumnCount(count);
	}

	/**
	 * Updates the initial row count used for table creation.
	 *
	 * @param {number} count New initial row count.
	 */
	function onChangeInitialRowCount(count) {
		setInitialRowCount(count);
	}

	/**
	 * Creates a table based on dimensions in local state.
	 *
	 */

	/**
	 * Toggles whether the table has a fixed layout or not.
	 */
	function onChangeFixedLayout() {
		setAttributes({ hasFixedLayout: !hasFixedLayout });
	}

	/**
	 * Changes the content of the currently selected cell.
	 *
	 * @param {Array} content A RichText content value.
	 */
	// function onChange(content) {
	// 	if (!selectedCell) {
	// 		return;
	// 	}

	// 	setAttributes(
	// 		updateSelectedCell(attributes, selectedCell, (cellAttributes) => ({
	// 			...cellAttributes,
	// 			content,
	// 		}))
	// 	);
	// 	console.log(attributes);
	// }
	const onChange = (content, rowIndex, colIndex, type) => {
		const changedContent = attributes[type].map((row, rowI) => {
			if( rowI === rowIndex ) {
				const newCells = row.cells.map((c, colI) => {
					if(colI === colIndex - 1) {
						return {...c, content: content}
					}
					return c
				})
				return {...row, cells: newCells}
			}
			return row;
		})
		setAttributes({[type]: changedContent});
	}

	/**
	 * Align text within the a column.
	 *
	 * @param {string} align The new alignment to apply to the column.
	 */
	function onChangeColumnAlignment(align) {
		if (!selectedCell) {
			return;
		}

		// Convert the cell selection to a column selection so that alignment
		// is applied to the entire column.
		const columnSelection = {
			type: "column",
			columnIndex: selectedCell.columnIndex,
		};

		const newAttributes = updateSelectedCell(
			attributes,
			columnSelection,
			(cellAttributes) => ({
				...cellAttributes,
				align,
			})
		);
		setAttributes(newAttributes);
	}

	/**
	 * Get the alignment of the currently selected cell.
	 *
	 * @return {string} The new alignment to apply to the column.
	 */
	function getCellAlignment() {
		if (!selectedCell) {
			return;
		}

		return getCellAttribute(attributes, selectedCell, "align");
	}

	/**
	 * Add or remove a `head` table section.
	 */
	function onToggleHeaderSection() {
		setAttributes(toggleSection(attributes, "head"));
	}

	/**
	 * Add or remove a `foot` table section.
	 */
	function onToggleFooterSection() {
		setAttributes(toggleSection(attributes, "foot"));
	}

	/**
	 * Inserts a row at the currently selected row index, plus `delta`.
	 *
	 * @param {number} delta Offset for selected row index at which to insert.
	 */
	function onInsertRow(delta) {
		if (!selectedCell) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell;
		const newRowIndex = rowIndex + delta;

		setAttributes(
			insertRow(attributes, {
				sectionName,
				rowIndex: newRowIndex,
			})
		);
		// Select the first cell of the new row.
		setSelectedCell({
			sectionName,
			rowIndex: newRowIndex,
			columnIndex: 0,
			type: "cell",
		});
	}

	/**
	 * Inserts a row before the currently selected row.
	 */
	function onInsertRowBefore() {
		onInsertRow(0);
	}

	/**
	 * Inserts a row after the currently selected row.
	 */
	function onInsertRowAfter() {
		onInsertRow(1);
	}

	/**
	 * Deletes the currently selected row.
	 */
	function onDeleteRow() {
		if (!selectedCell) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell;

		setSelectedCell();
		setAttributes(deleteRow(attributes, { sectionName, rowIndex }));
	}

	/**
	 * Inserts a column at the currently selected column index, plus `delta`.
	 *
	 * @param {number} delta Offset for selected column index at which to insert.
	 */
	function onInsertColumn(delta = 0) {
		if (!selectedCell) {
			return;
		}

		const { columnIndex } = selectedCell;
		const newColumnIndex = columnIndex + delta;

		setAttributes(
			insertColumn(attributes, {
				columnIndex: newColumnIndex,
			})
		);
		// Select the first cell of the new column.
		setSelectedCell({
			rowIndex: 0,
			columnIndex: newColumnIndex,
			type: "cell",
		});
	}

	/**
	 * Inserts a column before the currently selected column.
	 */
	function onInsertColumnBefore() {
		onInsertColumn(0);
	}

	/**
	 * Inserts a column after the currently selected column.
	 */
	function onInsertColumnAfter() {
		onInsertColumn(1);
	}

	/**
	 * Deletes the currently selected column.
	 */
	function onDeleteColumn() {
		if (!selectedCell) {
			return;
		}

		const { sectionName, columnIndex } = selectedCell;

		setSelectedCell();
		setAttributes(deleteColumn(attributes, { sectionName, columnIndex }));
	}

	useEffect(() => {
		if (!isSelected) {
			setSelectedCell();
		}
	}, [isSelected]);

	useEffect(() => {
		if (hasTableCreated) {
			tableRef?.current?.querySelector('td[contentEditable="true"]')?.focus();
			setHasTableCreated(false);
		}
	}, [hasTableCreated]);

	const sections = ["head", "body", "foot"].filter(
		(name) => !isEmptyTableSection(attributes[name])
	);

	const tableControls = [
		{
			icon: tableRowBefore,
			title: __("Insert row before"),
			isDisabled: !selectedCell,
			onClick: onInsertRowBefore,
		},
		{
			icon: tableRowAfter,
			title: __("Insert row after"),
			isDisabled: !selectedCell,
			onClick: onInsertRowAfter,
		},
		{
			icon: tableRowDelete,
			title: __("Delete row"),
			isDisabled: !selectedCell,
			onClick: onDeleteRow,
		},
		{
			icon: tableColumnBefore,
			title: __("Insert column before"),
			isDisabled: !selectedCell,
			onClick: onInsertColumnBefore,
		},
		{
			icon: tableColumnAfter,
			title: __("Insert column after"),
			isDisabled: !selectedCell,
			onClick: onInsertColumnAfter,
		},
		{
			icon: tableColumnDelete,
			title: __("Delete column"),
			isDisabled: !selectedCell,
			onClick: onDeleteColumn,
		},
	];
	const removeRow = (rowIndex) => {

		const newBodyElements = attributes.body.filter((row, index) => index !== rowIndex);
		console.log(newBodyElements);
		setAttributes({body: newBodyElements})
	};
	const addColumn = () => {
		const newHeadElements = attributes.head.map(row => {
			return {...row, cells: [...row.cells, {content: ""}] };
		});
		const newBodyElements = attributes.body.map(row => {
			return {...row, cells: [...row.cells, {content: ""}] };
		})
		setAttributes({head:newHeadElements, body: newBodyElements})	
	}
	const removeColumn = (colIndex) => {
		
		const newHeadElements = attributes.head.map(row => {
			const newCells = row.cells.filter((c, index) => index !== colIndex - 1);
			
			return {...row, cells: newCells}
		});
		const newBodyElements = attributes.body.map(row => {
			const newCells = row.cells.filter((c, index) => index !== colIndex - 1);
			return {...row, cells: newCells}
		});
		
		setAttributes({head:newHeadElements, body: newBodyElements})
	}
	const rowControls = [
		{
			icon: trash,
			title: __("Delete"),
			onClick: removeRow,
		},
	];
	const headerControls = [
		{
			icon: trash,
			title: __("Delete"),
			onClick: removeColumn,
		},
	]
	const showEditIcon = (e, rowIndex, colIndex) => {
		// console.log(e.target, rowIndex, colIndex);
		const rowElement = e.target.closest(".chart-table-row__body");
		const editIcon = rowElement.querySelector(".charts-edit-row");
		editIcon.classList.add("active");
	};

	const hideEditIcon = (e, rowIndex) => {
		// console.log(e.target, rowIndex);
		const rowElement = e.target.closest(".chart-table-row__body");
		const editIcon = rowElement.querySelector(".charts-edit-row");
		if (editIcon) {
			editIcon.classList.remove("active");
		}
	};
	const modifiedAttr = () => {
		const headValues = attributes.head.map((row) => {
			return {
				cells: [
					{ content: "", empty: true },
					...row.cells,
					{ content: "", iconHead: plus }
				]
			}
		});
		
		const bodyValues = attributes.body.map((row) => {
			return {
				cells: [
					{ content: "", numero: true },
					...row.cells,
					{ content: "", iconBody: more },
				],
			};
		});
		
		return { head: headValues, body: bodyValues };
	};
	const renderedSections = ["head", "body"].map((name) => {
		const modifiedAttributes = modifiedAttr();
		console.log(modifiedAttributes);
		return modifiedAttributes[name].map(({ cells }, rowIndex) => (
			<div
				key={rowIndex}
				className={classnames("chart-table-row", `chart-table-row__${name}`)}
				onMouseLeave={(e) => hideEditIcon(e, rowIndex)}
			>
				{cells.map(
					({ content, empty, numero, iconHead, iconBody }, columnIndex) => {
						if (empty) {
							return <div></div>;
						}
						if (numero) {
							return <div style={{ textAlign: "right" }}>{rowIndex}</div>;
						}
						if (iconHead) {
							return (
								<div>
									<Button icon={iconHead} onClick={addColumn} />
								</div>
							);
						}
						if (iconBody) {
							return (
								<div className="charts-edit-row">
									<DropdownMenu
										icon={more}
										label={__("Edit Row")}
										className="charts-dropdown"
									>
										{({ onClose }) => (
											<MenuGroup>
												{rowControls.map((control, index) => (
													<MenuItem
														icon={control.icon}
														key={index}
														onClick={() => {
															control.onClick(rowIndex);
															onClose();
														}}
													>
														{control.title}
													</MenuItem>
												))}
											</MenuGroup>
										)}
									</DropdownMenu>
								</div>
							);
						}
						return (
							<div>
								{name === 'head' ? <div><RichText
							//  tagName={ CellTag }
								key={columnIndex}
								className={classnames("wp-block-table__cell-content")}
								value={content}
								onChange={(content) => onChange(content, rowIndex, columnIndex, 'head')}
							

						/> <div><DropdownMenu
								icon={more}
								label={__("Edit Column")}
								className="charts-dropdown"
							>
								{({ onClose }) => (
									<MenuGroup>
										{headerControls.map((control, index) => (
											<MenuItem
												icon={control.icon}
												key={index}
												onClick={() => {
													control.onClick(columnIndex);
													onClose();
												}}
											>
												{control.title}
											</MenuItem>
										))}
									</MenuGroup>
								)}
							</DropdownMenu></div></div> :  <RichText
							//  tagName={ CellTag }
							key={columnIndex}
							className={classnames("wp-block-table__cell-content")}
							value={content}
							onChange={(content) => onChange(content, rowIndex, columnIndex, 'body')}
							onMouseEnter={(e) => showEditIcon(e, rowIndex, columnIndex)}

							//  unstableOnFocus={ () => {
							// 	 setSelectedCell( {
							// 		 sectionName: name,
							// 		 rowIndex,
							// 		 columnIndex,
							// 		 type: 'cell',
							// 	 } );
							//  } }
							//  aria-label={ cellAriaLabel[ name ] }
							//  placeholder={ placeholder[ name ] }
						/>}
							</div>
						);
					}
				)}
			</div>
		));
	});

	const isEmpty = !sections.length;

	return (
		<div
			className={classnames(
				"charts-table",
				colorProps.className,
				borderProps.className
			)}
			style={{ ...colorProps.style, ...borderProps.style }}
		>
			{renderedSections}
		</div>
	);
};

export default Table;
