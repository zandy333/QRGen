import {initializeBlock, useBase, useLoadable, useWatchable, useRecordById} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {cursor} from '@airtable/blocks';
import ReactDOM from 'react-dom';


// Add the external QR Code rendering library (https://github.com/zpao/qrcode.react)
// This third-party library is licensed under ISC License (https://github.com/zpao/qrcode.react/blob/master/LICENSE)
// This license allows commercial usage without any restrictions, for the QR Code rendering library used in this block
var QRCode = require('qrcode.react'); 


function QRGen() {
  
  	// Maximum Data Capacity Limit Setting for the QR Code to be displayed
  	const MAX_CAPACITY = 2001; 
	
	// Get a reference to the base
	const base = useBase(); 
	
	// Set up watchables
	useLoadable(cursor); 
	useWatchable(cursor, ['activeTableId', 'selectedFieldIds', 'selectedRecordIds']); 
	
	// Obtain a reference to the active table
	const table = base.getTableByIdIfExists(cursor.activeTableId); 
	
	// If table is not null
	const currentTable = table ? table : null;
	
	// If currentTable is not null
	const field = currentTable ? currentTable.getFieldByIdIfExists(cursor.selectedFieldIds[0]) : null;
	
	// If both currentTable and field are not null
	const record = currentTable && field ? useRecordById(currentTable, cursor.selectedRecordIds[0]) : useRecordById(null, null);
	
	// If only one cell on the table is selected
	const onlyOneCellSelected = ((cursor.selectedFieldIds.length == 1) && (cursor.selectedRecordIds.length == 1)) ? true : false;
	
	// If more than one cell on the table are selected
	const severalCellsSelected = ((cursor.selectedFieldIds.length > 1) || (cursor.selectedRecordIds.length > 1)) ? true : false;
	
	// Obtain a reference to the selected table cell contents' length (size)
	const cellLength = record? record.getCellValueAsString(cursor.selectedFieldIds[0]).length : null;
	
	// If all currentTable, record and field are not null
	// only one cell is selected on the table
	// table cell contents are within the maximum limit 
	const cellval = currentTable && record && field && onlyOneCellSelected && (cellLength < MAX_CAPACITY) ? record.getCellValueAsString(cursor.selectedFieldIds[0]) : "";
	
	// If a record was deleted via right-click menu while the cell is selected
	const recDeletedByRightClick = (!field || !record) ? true : false;
		
	// Handle the following five cases using a nested ternary expression
	// case 1 : if only one cell is selected 
	// case 2 : if several cells are seleceted
	// case 3 : if no cell is selected
	// case 4 : if a record was deleted via right-click menu while the cell is selected
	// case 5 : if selected table cell contents are greater than (or less than) the pre-set maximum limit
	const text = (cellLength >= MAX_CAPACITY && onlyOneCellSelected && !recDeletedByRightClick) ? "Cell contents are too large to fit in a QR Code." : onlyOneCellSelected && !recDeletedByRightClick ? "" : severalCellsSelected && !recDeletedByRightClick ? "Select only one cell." : "Select a table cell.";
	
	// Settings for showing the QR Code
	const showQR = {backgroundColor: "#fff", position: "absolute", display: "block", padding: "5%", left: "5%", top: "5%", 
			width: "90%", height: "auto"};
			
	// Settings for hiding the QR Code
	const hideQR = {backgroundColor: "#fff", position: "absolute", display: "none", padding: "5%", left: "5%", top: "5%", 
			width: "90%", height: "auto"};
		
	// Decide whether to show or hide the QR Code		
	const qrstyle = onlyOneCellSelected && !recDeletedByRightClick && cellLength < MAX_CAPACITY ? showQR : hideQR;
	
	// Settings for text
	const textstyle = {textAlign: "center", display: "block"};


	return ( // Selectively display the text message or the QR Code via the imported third-party QR Code library
		<> 
		<p style={textstyle}>{text}</p>
		<QRCode value={cellval} style={qrstyle} renderAs="svg" />	
		</>
		);
}

initializeBlock(() => <QRGen />);


