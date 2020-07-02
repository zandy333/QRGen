import {initializeBlock, useBase, useLoadable, useWatchable, useRecordById, useRecordIds} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {cursor} from '@airtable/blocks';
import ReactDOM from 'react-dom';

var QRCode = require('qrcode.react'); // Add the external QR Code library (https://github.com/zpao/qrcode.react)
			// This third-party library is licensed under ISC License (https://github.com/zpao/qrcode.react/blob/master/LICENSE)
			// This license allows commercial usage without any restrictions, for the QR Code library used in this block

function QRGen() {
  
  	const MAX_CAPACITY = 2001; // Maximum Data Capacity Limit Setting for the QR Code to be displayed
	
	const base = useBase(); // Get a reference to the base
	
	var currentTable = base.getTableByIdIfExists(cursor.activeTableId); // Get a reference to the active table
	var field = null;
	var recordIds = null;
	var record = null;
	var cellval = "";
	var text = "";
	var qrstyle = null;
	var textstyle = null;
	
	useLoadable(cursor); 
	useWatchable(cursor, ['activeTableId', 'selectedFieldIds', 'selectedRecordIds']); // Set up watchables	
	
	if (currentTable != null) { // If currentTable is NOT null (this may momentarily become null just when a new table is created)
	
		if (cursor.selectedFieldIds[0] == null) { // If no cell is selected on the table
		
			field = currentTable.getFieldIfExists("");
			recordIds = useRecordIds(null);
			record = useRecordById(null, null);
			cellval = "";
			text = "Select a table cell.";
			qrstyle = {backgroundColor: "#fff", position: "absolute", display: "none", padding: "5%", left: "5%", top: "5%", 
			width: "90%", height: "auto"};
			
		} else { // If some cell is selected on the table
		
			field = currentTable.getFieldByIdIfExists(cursor.selectedFieldIds[0]);
			recordIds = useRecordIds(currentTable);
			record = useRecordById(currentTable, cursor.selectedRecordIds[0]);
			
			if ((cursor.selectedFieldIds.length == 1) && (cursor.selectedRecordIds.length == 1) && (record != null)) { // Make sure no multiple cells are selected, and handle the error if a record was deleted via right click menu, while the cell is still selected
			 
				cellval = record.getCellValueAsString(cursor.selectedFieldIds[0]);
				text = "";
				qrstyle = {backgroundColor: "#fff", position: "absolute", display: "block", padding: "5%", left: "5%", top: "5%", 
				width: "90%", height: "auto"};
				
			} else if (((cursor.selectedFieldIds.length != 1) || (cursor.selectedRecordIds.length != 1)) && (record != null)) { // If more than one cells are selected
				cellval = "";
				text = "Select only one cell.";
				qrstyle = {backgroundColor: "#fff", position: "absolute", display: "none", padding: "5%", left: "5%", top: "5%", 
				width: "90%", height: "auto"};
				
			} else if (record == null) { // If the record containing the selected cell was deleted via right click menu

				cellval = "";
				text = "Select a table cell.";
				qrstyle = {backgroundColor: "#fff", position: "absolute", display: "none", padding: "5%", left: "5%", top: "5%", 
				width: "90%", height: "auto"};			
			}
			
		}
	
	} else { // If currentTable is null (just when a new table is created)
		
		field = null;
		recordIds = useRecordIds(null);
		record = useRecordById(null, null);
		cellval = "";
		text = "Table is empty.";
		qrstyle = {backgroundColor: "#fff", position: "absolute", display: "none", padding: "5%", left: "5%", top: "5%", 
			width: "90%", height: "auto"};
		
	}
	
	
	if (cellval.length < MAX_CAPACITY) { // If the cell contents are within the maximum capacity limit of a QR Code
		cellval = cellval;
		
	} else { // If the cell contents exceed the maximum capacity limit of a QR Code
		cellval = "";
		text = "Cell contents are too large to fit in a QR Code.";
		qrstyle = {backgroundColor: "#fff", position: "absolute", display: "none", padding: "5%", left: "5%", top: "5%", 
			width: "90%", height: "auto"};
	}
	
	
	textstyle = {textAlign: "center", display: "block"};

	return ( // Display the text message and QR Code accordingly via the imported third-party QR Code library
		<> 
		<p style={textstyle}>{text}</p>
		<QRCode value={cellval} style={qrstyle} renderAs="svg" />	
		</>
		);
}

initializeBlock(() => <QRGen />);
